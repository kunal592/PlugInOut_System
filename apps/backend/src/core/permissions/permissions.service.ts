import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { RedisService } from '../redis';
import { UserRole, ToolAccessStatus, PricingType } from '@prisma/client';

export interface PermissionCheck {
    userId: string;
    toolSlug: string;
    action?: string;
}

export interface PermissionResult {
    allowed: boolean;
    reason?: string;
}

@Injectable()
export class PermissionsService {
    private readonly logger = new Logger(PermissionsService.name);
    private readonly cachePrefix = 'permissions:';
    private readonly cacheTTL = 300; // 5 minutes

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    /**
     * Check if user has access to a tool
     */
    async canAccessTool(check: PermissionCheck): Promise<PermissionResult> {
        const { userId, toolSlug } = check;

        // Check cache first
        const cacheKey = `${this.cachePrefix}${userId}:${toolSlug}`;
        const cached = await this.redis.get(cacheKey);

        if (cached !== null) {
            return JSON.parse(cached);
        }

        // Check user exists and is active
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, isActive: true },
        });

        if (!user) {
            const result = { allowed: false, reason: 'User not found' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        if (!user.isActive) {
            const result = { allowed: false, reason: 'User is inactive' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Super admins have access to everything
        if (user.role === UserRole.SUPER_ADMIN) {
            const result = { allowed: true, reason: 'Super admin access' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Get tool and check if enabled
        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug },
            select: {
                id: true,
                enabled: true,
                isPublic: true,
                permissions: true,
                pricingType: true,
                basePrice: true
            },
        });

        if (!tool) {
            const result = { allowed: false, reason: 'Tool not found' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        if (!tool.enabled) {
            const result = { allowed: false, reason: 'Tool is disabled' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Check if user has the required role
        // tool.permissions is UserRole[]
        const hasRequiredRole = tool.permissions.includes(user.role) ||
            tool.permissions.includes(UserRole.USER); // Default access

        if (!hasRequiredRole) {
            const result = { allowed: false, reason: 'Insufficient role' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Check user_tools mapping
        const userTool = await this.prisma.userTool.findUnique({
            where: {
                userId_toolId: { userId, toolId: tool.id },
            },
            select: { status: true, expiresAt: true },
        });

        // If tool is free and public, and user has no prior status, allow
        const isFree = tool.pricingType === PricingType.FREE || tool.basePrice === 0;
        const isFreePublic = tool.isPublic && isFree;

        if (!userTool) {
            if (isFreePublic) {
                const result = { allowed: true, reason: 'Free public tool' };
                await this.cacheResult(cacheKey, result);
                return result;
            }
            const result = { allowed: false, reason: 'No tool access' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Check access status
        if (userTool.status !== ToolAccessStatus.ACTIVE) {
            const result = { allowed: false, reason: `Access ${userTool.status.toLowerCase()}` };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        // Check expiration
        if (userTool.expiresAt && userTool.expiresAt < new Date()) {
            const result = { allowed: false, reason: 'Access expired' };
            await this.cacheResult(cacheKey, result);
            return result;
        }

        const result = { allowed: true };
        await this.cacheResult(cacheKey, result);
        return result;
    }

    /**
     * Check if user has admin role
     */
    async isAdmin(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    }

    /**
     * Check if user is super admin
     */
    async isSuperAdmin(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        return user?.role === UserRole.SUPER_ADMIN;
    }

    /**
     * Get all tools a user can access
     */
    async getAccessibleTools(userId: string): Promise<string[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true },
        });

        if (!user || !user.isActive) {
            return [];
        }

        // Super admin gets all enabled tools
        if (user.role === UserRole.SUPER_ADMIN) {
            const tools = await this.prisma.tool.findMany({
                where: { enabled: true },
                select: { slug: true },
            });
            return tools.map((t) => t.slug);
        }

        // Get user's accessible tools
        const userTools = await this.prisma.userTool.findMany({
            where: {
                userId,
                status: ToolAccessStatus.ACTIVE,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            include: {
                tool: {
                    select: { slug: true, enabled: true },
                },
            },
        });

        // Filter out disabled tools
        return userTools
            .filter((ut) => ut.tool.enabled)
            .map((ut) => ut.tool.slug);
    }

    /**
     * Invalidate permission cache for a user
     */
    async invalidateCache(userId: string, toolSlug?: string): Promise<void> {
        if (toolSlug) {
            await this.redis.del(`${this.cachePrefix}${userId}:${toolSlug}`);
        } else {
            await this.redis.delPattern(`${this.cachePrefix}${userId}:*`);
        }
    }

    /**
     * Cache permission result
     */
    private async cacheResult(key: string, result: PermissionResult): Promise<void> {
        try {
            await this.redis.setJson(key, result, this.cacheTTL);
        } catch (error) {
            this.logger.warn(`Failed to cache permission: ${error}`);
        }
    }
}
