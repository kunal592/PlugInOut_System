import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EventPublisher } from '../events/event.publisher';
import { EventTypes } from '../events/event.types';
import { ToolAccessStatus, SubscriptionStatus } from '@prisma/client';

/**
 * Billing Events that can be emitted
 */
export interface BillingEvent {
    type: string;
    userId: string;
    toolId?: string;
    amount?: number;
    currency?: string;
    externalId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
    success: boolean;
    userToolId: string;
    message: string;
}

/**
 * Subscription data for creation
 */
export interface CreateSubscriptionInput {
    userId: string;
    razorpaySubscriptionId: string;
    razorpayPlanId: string;
    razorpayCustomerId: string;
    periodStart?: Date;
    periodEnd?: Date;
}

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventPublisher: EventPublisher,
    ) { }

    /**
     * Process tool purchase - ABSTRACTED
     * This method should be called by webhooks from payment providers
     * Core never calls payment provider APIs directly
     */
    async processToolPurchase(
        userId: string,
        toolId: string,
        externalTransactionId?: string,
    ): Promise<PurchaseResult> {
        this.logger.log(`Processing tool purchase: user=${userId}, tool=${toolId}`);

        // Verify tool exists and is enabled
        const tool = await this.prisma.tool.findUnique({
            where: { id: toolId },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        if (!tool.enabled) {
            throw new Error('Tool is not available for purchase');
        }

        // Check if user already has access
        const existingAccess = await this.prisma.userTool.findUnique({
            where: {
                userId_toolId: { userId, toolId },
            },
        });

        if (existingAccess && existingAccess.status === ToolAccessStatus.ACTIVE) {
            return {
                success: true,
                userToolId: existingAccess.id,
                message: 'User already has access to this tool',
            };
        }

        // Grant access
        const userTool = await this.prisma.userTool.upsert({
            where: {
                userId_toolId: { userId, toolId },
            },
            update: {
                status: ToolAccessStatus.ACTIVE,
                activatedAt: new Date(),
                expiresAt: null, // One-time purchase = no expiry
            },
            create: {
                userId,
                toolId,
                status: ToolAccessStatus.ACTIVE,
                activatedAt: new Date(),
            },
        });

        // Emit billing event
        await this.eventPublisher.publish({
            type: EventTypes.TOOL_PURCHASED,
            aggregateType: 'UserTool',
            aggregateId: userTool.id,
            userId,
            payload: {
                toolId,
                toolSlug: tool.slug,
                toolName: tool.name,
                price: tool.basePrice, // Updated to basePrice
                currency: tool.currency, // Include currency
                externalTransactionId,
            },
        });

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_ACTIVATED,
            aggregateType: 'UserTool',
            aggregateId: userTool.id,
            userId,
            payload: {
                toolId,
                toolSlug: tool.slug,
            },
        });

        this.logger.log(`Tool purchase completed: userTool=${userTool.id}`);

        return {
            success: true,
            userToolId: userTool.id,
            message: 'Tool access granted successfully',
        };
    }

    /**
     * Handle subscription creation (from webhook)
     */
    async createSubscription(input: CreateSubscriptionInput): Promise<void> {
        this.logger.log(`Creating subscription for user: ${input.userId}`);

        const subscription = await this.prisma.subscription.create({
            data: {
                userId: input.userId,
                razorpaySubscriptionId: input.razorpaySubscriptionId,
                razorpayPlanId: input.razorpayPlanId,
                razorpayCustomerId: input.razorpayCustomerId,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: input.periodStart,
                currentPeriodEnd: input.periodEnd,
            },
        });

        await this.eventPublisher.publish({
            type: EventTypes.SUBSCRIPTION_CREATED,
            aggregateType: 'Subscription',
            aggregateId: subscription.id,
            userId: input.userId,
            payload: {
                razorpaySubscriptionId: input.razorpaySubscriptionId,
                planId: input.razorpayPlanId,
            },
        });
    }

    /**
     * Handle subscription update (from webhook)
     */
    async updateSubscription(
        razorpaySubscriptionId: string,
        status: SubscriptionStatus,
        periodEnd?: Date,
    ): Promise<void> {
        this.logger.log(`Updating subscription: ${razorpaySubscriptionId}`);

        const subscription = await this.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status,
                currentPeriodEnd: periodEnd,
                cancelledAt: status === SubscriptionStatus.CANCELLED ? new Date() : undefined,
            },
        });

        await this.eventPublisher.publish({
            type: EventTypes.SUBSCRIPTION_UPDATED,
            aggregateType: 'Subscription',
            aggregateId: subscription.id,
            userId: subscription.userId,
            payload: {
                razorpaySubscriptionId,
                newStatus: status,
                periodEnd,
            },
        });
    }

    /**
     * Handle subscription cancellation (from webhook)
     */
    async cancelSubscription(razorpaySubscriptionId: string): Promise<void> {
        await this.updateSubscription(razorpaySubscriptionId, SubscriptionStatus.CANCELLED);

        const subscription = await this.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });

        if (subscription) {
            await this.eventPublisher.publish({
                type: EventTypes.SUBSCRIPTION_CANCELLED,
                aggregateType: 'Subscription',
                aggregateId: subscription.id,
                userId: subscription.userId,
                payload: { razorpaySubscriptionId },
            });
        }
    }

    /**
     * Handle tool expiration (for subscription-based tools)
     */
    async expireToolAccess(userToolId: string): Promise<void> {
        const userTool = await this.prisma.userTool.findUnique({
            where: { id: userToolId },
            include: { tool: true },
        });

        if (!userTool) {
            return;
        }

        await this.prisma.userTool.update({
            where: { id: userToolId },
            data: { status: ToolAccessStatus.EXPIRED },
        });

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_EXPIRED,
            aggregateType: 'UserTool',
            aggregateId: userToolId,
            userId: userTool.userId,
            payload: {
                toolId: userTool.toolId,
                toolSlug: userTool.tool.slug,
            },
        });
    }

    /**
     * Get user's active subscriptions
     */
    async getUserSubscriptions(userId: string) {
        return this.prisma.subscription.findMany({
            where: {
                userId,
                status: SubscriptionStatus.ACTIVE,
            },
        });
    }

    /**
     * Check if user has active subscription
     */
    async hasActiveSubscription(userId: string): Promise<boolean> {
        const count = await this.prisma.subscription.count({
            where: {
                userId,
                status: SubscriptionStatus.ACTIVE,
            },
        });
        return count > 0;
    }

    /**
     * Process expired accesses (cron job candidate)
     */
    async processExpiredAccesses(): Promise<number> {
        const expiredAccesses = await this.prisma.userTool.findMany({
            where: {
                status: ToolAccessStatus.ACTIVE,
                expiresAt: { lt: new Date() },
            },
        });

        for (const access of expiredAccesses) {
            await this.expireToolAccess(access.id);
        }

        if (expiredAccesses.length > 0) {
            this.logger.log(`Expired ${expiredAccesses.length} tool accesses`);
        }

        return expiredAccesses.length;
    }
}
