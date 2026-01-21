import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EventPublisher } from '../events/event.publisher';
import { EventTypes } from '../events/event.types';
import { ToolAccessStatus } from '@prisma/client';

export interface UserToolWithDetails {
    id: string;
    userId: string;
    toolId: string;
    status: ToolAccessStatus;
    expiresAt: Date | null;
    purchasedAt: Date;
    activatedAt: Date | null;
    tool: {
        slug: string;
        name: string;
        description: string | null;
        icon: string | null;
        routes: string;
        category: string | null;
        enabled: boolean;
    };
}

@Injectable()
export class UserToolsService {
    private readonly logger = new Logger(UserToolsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventPublisher: EventPublisher,
    ) { }

    /**
     * Get all tools for a user with details
     */
    async getUserTools(userId: string): Promise<UserToolWithDetails[]> {
        const userTools = await this.prisma.userTool.findMany({
            where: { userId },
            include: {
                tool: {
                    select: {
                        slug: true,
                        name: true,
                        description: true,
                        icon: true,
                        routes: true,
                        category: true,
                        enabled: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return userTools;
    }

    /**
     * Get active tools for a user (for sidebar)
     */
    async getActiveUserTools(userId: string): Promise<UserToolWithDetails[]> {
        const userTools = await this.prisma.userTool.findMany({
            where: {
                userId,
                status: ToolAccessStatus.ACTIVE,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
                tool: {
                    enabled: true,
                },
            },
            include: {
                tool: {
                    select: {
                        slug: true,
                        name: true,
                        description: true,
                        icon: true,
                        routes: true,
                        category: true,
                        enabled: true,
                    },
                },
            },
            orderBy: { tool: { name: 'asc' } },
        });

        return userTools;
    }

    /**
     * Get a specific user tool
     */
    async getUserTool(userId: string, toolSlug: string): Promise<UserToolWithDetails | null> {
        const userTool = await this.prisma.userTool.findFirst({
            where: {
                userId,
                tool: { slug: toolSlug },
            },
            include: {
                tool: {
                    select: {
                        slug: true,
                        name: true,
                        description: true,
                        icon: true,
                        routes: true,
                        category: true,
                        enabled: true,
                    },
                },
            },
        });

        return userTool;
    }

    /**
     * Grant tool access to user
     */
    async grantAccess(
        userId: string,
        toolId: string,
        options?: {
            expiresAt?: Date;
            status?: ToolAccessStatus;
        },
    ): Promise<UserToolWithDetails> {
        const tool = await this.prisma.tool.findUnique({
            where: { id: toolId },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        const userTool = await this.prisma.userTool.upsert({
            where: {
                userId_toolId: { userId, toolId },
            },
            update: {
                status: options?.status || ToolAccessStatus.ACTIVE,
                expiresAt: options?.expiresAt,
                activatedAt: new Date(),
            },
            create: {
                userId,
                toolId,
                status: options?.status || ToolAccessStatus.ACTIVE,
                expiresAt: options?.expiresAt,
                activatedAt: new Date(),
            },
            include: {
                tool: {
                    select: {
                        slug: true,
                        name: true,
                        description: true,
                        icon: true,
                        routes: true,
                        category: true,
                        enabled: true,
                    },
                },
            },
        });

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_ACCESS_GRANTED,
            aggregateType: 'UserTool',
            aggregateId: userTool.id,
            userId,
            payload: {
                toolId,
                toolSlug: tool.slug,
                expiresAt: options?.expiresAt,
            },
        });

        this.logger.log(`Access granted: user=${userId}, tool=${tool.slug}`);

        return userTool;
    }

    /**
     * Revoke tool access from user
     */
    async revokeAccess(
        userId: string,
        toolSlug: string,
        reason?: string,
    ): Promise<void> {
        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        const userTool = await this.prisma.userTool.findUnique({
            where: {
                userId_toolId: { userId, toolId: tool.id },
            },
        });

        if (!userTool) {
            return; // Already doesn't have access
        }

        await this.prisma.userTool.update({
            where: { id: userTool.id },
            data: { status: ToolAccessStatus.REVOKED },
        });

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_ACCESS_REVOKED,
            aggregateType: 'UserTool',
            aggregateId: userTool.id,
            userId,
            payload: {
                toolId: tool.id,
                toolSlug,
                reason,
            },
        });

        this.logger.log(`Access revoked: user=${userId}, tool=${toolSlug}`);
    }

    /**
     * Check if user has active access to tool
     */
    async hasAccess(userId: string, toolSlug: string): Promise<boolean> {
        const count = await this.prisma.userTool.count({
            where: {
                userId,
                tool: { slug: toolSlug },
                status: ToolAccessStatus.ACTIVE,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });

        return count > 0;
    }

    /**
     * Get all users with access to a tool
     */
    async getToolUsers(
        toolSlug: string,
        options?: { status?: ToolAccessStatus },
    ): Promise<Array<{ userId: string; status: ToolAccessStatus; expiresAt: Date | null }>> {
        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        const userTools = await this.prisma.userTool.findMany({
            where: {
                toolId: tool.id,
                ...(options?.status && { status: options.status }),
            },
            select: {
                userId: true,
                status: true,
                expiresAt: true,
            },
        });

        return userTools;
    }

    /**
     * Get available tools for marketplace (tools user doesn't have)
     */
    async getAvailableTools(userId: string): Promise<Array<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        price: number;
        pricingType: string;
        icon: string | null;
        category: string | null;
    }>> {
        // Get tools user already has
        const userToolIds = await this.prisma.userTool.findMany({
            where: { userId },
            select: { toolId: true },
        });

        const ownedToolIds = userToolIds.map((ut) => ut.toolId);

        // Get available tools
        const tools = await this.prisma.tool.findMany({
            where: {
                enabled: true,
                isPublic: true,
                id: { notIn: ownedToolIds },
            },
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                price: true,
                pricingType: true,
                icon: true,
                category: true,
            },
            orderBy: { name: 'asc' },
        });

        return tools;
    }
}
