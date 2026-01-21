import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EventPublisher } from '../events/event.publisher';
import { EventTypes } from '../events/event.types';
import { PluginRegistry } from '../plugin-manager/plugin.registry';
import { ToolAccessStatus, PricingType, UserRole } from '@prisma/client';

export interface AdminToolUpdate {
    name?: string;
    description?: string;
    enabled?: boolean;
    price?: number;
    pricingType?: PricingType;
    isPublic?: boolean;
}

export interface AdminUserToolOverride {
    userId: string;
    toolSlug: string;
    action: 'grant' | 'revoke' | 'extend';
    expiresAt?: Date;
    reason?: string;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalTools: number;
    enabledTools: number;
    totalToolAccesses: number;
    activeSubscriptions: number;
    recentEvents: number;
}

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventPublisher: EventPublisher,
        private readonly pluginRegistry: PluginRegistry,
    ) { }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const [
            totalUsers,
            activeUsers,
            totalTools,
            enabledTools,
            totalToolAccesses,
            activeSubscriptions,
            recentEvents,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.tool.count(),
            this.prisma.tool.count({ where: { enabled: true } }),
            this.prisma.userTool.count({ where: { status: ToolAccessStatus.ACTIVE } }),
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.event.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                },
            }),
        ]);

        return {
            totalUsers,
            activeUsers,
            totalTools,
            enabledTools,
            totalToolAccesses,
            activeSubscriptions,
            recentEvents,
        };
    }

    /**
     * Get all tools (admin view)
     */
    async getAllTools() {
        return this.prisma.tool.findMany({
            include: {
                _count: {
                    select: { userTools: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * Get tool details by slug
     */
    async getToolBySlug(slug: string) {
        const tool = await this.prisma.tool.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { userTools: true },
                },
                userTools: {
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        return tool;
    }

    /**
     * Update tool configuration
     */
    async updateTool(slug: string, update: AdminToolUpdate, adminId: string): Promise<void> {
        const tool = await this.prisma.tool.findUnique({ where: { slug } });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        const updatedTool = await this.prisma.tool.update({
            where: { slug },
            data: update,
        });

        // If price changed, emit event
        if (update.price !== undefined && update.price !== tool.basePrice) {
            await this.eventPublisher.publish({
                type: EventTypes.ADMIN_PRICE_CHANGE,
                aggregateType: 'Tool',
                aggregateId: tool.id,
                userId: adminId,
                payload: {
                    slug,
                    oldPrice: tool.basePrice,
                    newPrice: update.price,
                },
            });
        }

        // If enabled status changed, emit event and update registry
        if (update.enabled !== undefined && update.enabled !== tool.enabled) {
            await this.eventPublisher.publish({
                type: EventTypes.ADMIN_TOOL_TOGGLE,
                aggregateType: 'Tool',
                aggregateId: tool.id,
                userId: adminId,
                payload: {
                    slug,
                    enabled: update.enabled,
                },
            });

            if (update.enabled) {
                await this.pluginRegistry.enable(slug);
            } else {
                await this.pluginRegistry.disable(slug);
            }
        }

        this.logger.log(`Tool updated by admin: ${slug}`);
    }

    /**
     * Enable a tool
     */
    async enableTool(slug: string, adminId: string): Promise<void> {
        await this.updateTool(slug, { enabled: true }, adminId);
    }

    /**
     * Disable a tool
     */
    async disableTool(slug: string, adminId: string): Promise<void> {
        await this.updateTool(slug, { enabled: false }, adminId);
    }

    /**
     * Change tool pricing
     */
    async updateToolPricing(
        slug: string,
        price: number,
        pricingType: PricingType,
        adminId: string,
    ): Promise<void> {
        await this.updateTool(slug, { price, pricingType }, adminId);
    }

    /**
     * Override user tool access
     */
    async overrideUserToolAccess(
        override: AdminUserToolOverride,
        adminId: string,
    ): Promise<void> {
        const { userId, toolSlug, action, expiresAt, reason } = override;

        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let newStatus: ToolAccessStatus;

        switch (action) {
            case 'grant':
                newStatus = ToolAccessStatus.ACTIVE;
                await this.prisma.userTool.upsert({
                    where: {
                        userId_toolId: { userId, toolId: tool.id },
                    },
                    update: {
                        status: newStatus,
                        expiresAt,
                        activatedAt: new Date(),
                    },
                    create: {
                        userId,
                        toolId: tool.id,
                        status: newStatus,
                        expiresAt,
                        activatedAt: new Date(),
                    },
                });
                break;

            case 'revoke':
                newStatus = ToolAccessStatus.REVOKED;
                await this.prisma.userTool.updateMany({
                    where: {
                        userId,
                        toolId: tool.id,
                    },
                    data: { status: newStatus },
                });
                break;

            case 'extend':
                if (!expiresAt) {
                    throw new Error('expiresAt is required for extend action');
                }
                await this.prisma.userTool.updateMany({
                    where: {
                        userId,
                        toolId: tool.id,
                    },
                    data: { expiresAt },
                });
                break;
        }

        await this.eventPublisher.publish({
            type: EventTypes.ADMIN_ACCESS_OVERRIDE,
            aggregateType: 'UserTool',
            aggregateId: `${userId}:${tool.id}`,
            userId: adminId,
            payload: {
                targetUserId: userId,
                targetUserEmail: user.email,
                toolSlug,
                action,
                expiresAt,
                reason,
            },
        });

        this.logger.log(`Admin ${adminId} ${action}ed access for user ${userId} to tool ${toolSlug}`);
    }

    /**
     * Get all users (paginated)
     */
    async getUsers(options: { page?: number; limit?: number; search?: string }) {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 20, 100);
        const skip = (page - 1) * limit;

        const where = options.search
            ? {
                OR: [
                    { email: { contains: options.search, mode: 'insensitive' as const } },
                    { firstName: { contains: options.search, mode: 'insensitive' as const } },
                    { lastName: { contains: options.search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: {
                        select: { userTools: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get user details with tools
     */
    async getUserDetails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userTools: {
                    include: {
                        tool: {
                            select: {
                                slug: true,
                                name: true,
                                icon: true,
                            },
                        },
                    },
                },
                subscriptions: true,
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: UserRole, adminId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        await this.eventPublisher.publish({
            type: EventTypes.USER_UPDATED,
            aggregateType: 'User',
            aggregateId: userId,
            userId: adminId,
            payload: {
                action: 'role_change',
                oldRole: user.role,
                newRole: role,
            },
        });

        this.logger.log(`User ${userId} role changed to ${role} by admin ${adminId}`);
    }

    /**
     * Deactivate user
     */
    async deactivateUser(userId: string, adminId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });

        this.logger.log(`User ${userId} deactivated by admin ${adminId}`);
    }

    /**
     * Activate user
     */
    async activateUser(userId: string, adminId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: true },
        });

        this.logger.log(`User ${userId} activated by admin ${adminId}`);
    }

    /**
     * Get recent events
     */
    async getRecentEvents(limit: number = 50) {
        return this.prisma.event.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Get user tool mappings for a specific tool
     */
    async getToolUserMappings(toolSlug: string) {
        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        return this.prisma.userTool.findMany({
            where: { toolId: tool.id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
