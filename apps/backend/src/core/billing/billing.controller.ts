import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Webhook payload structure (generic - adapt for specific providers)
 */
interface WebhookPayload {
    type: string;
    data: {
        userId?: string;
        toolId?: string;
        externalId?: string;
        amount?: number;
        currency?: string;
        status?: string;
        periodStart?: string;
        periodEnd?: string;
        planId?: string;
        planName?: string;
        [key: string]: unknown;
    };
}

@Controller('billing')
export class BillingController {
    private readonly logger = new Logger(BillingController.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Webhook endpoint for payment providers
     * This is a generic handler - implement provider-specific verification
     */
    @Post('webhook')
    @Public()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: WebhookPayload,
        @Headers('x-webhook-signature') signature: string,
    ) {
        this.logger.log(`Received billing webhook: ${payload.type}`);

        // Verify webhook signature
        const isValid = this.verifyWebhookSignature(signature, payload);
        if (!isValid) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        try {
            await this.processWebhookEvent(payload);
            return { received: true };
        } catch (error) {
            this.logger.error(`Webhook processing failed: ${error}`);
            // Return 200 to prevent retries for handled errors
            return { received: true, error: (error as Error).message };
        }
    }

    /**
     * Verify webhook signature (provider-specific implementation)
     */
    private verifyWebhookSignature(
        signature: string,
        payload: WebhookPayload,
    ): boolean {
        const webhookSecret = this.configService.get<string>('BILLING_WEBHOOK_SECRET');

        // In development, allow without signature
        if (process.env.NODE_ENV === 'development' && !webhookSecret) {
            return true;
        }

        if (!webhookSecret || !signature) {
            return false;
        }

        // TODO: Implement provider-specific signature verification
        // For Stripe: stripe.webhooks.constructEvent()
        // For Razorpay: crypto.createHmac()
        // This is a placeholder - implement based on your payment provider

        return true; // Placeholder - always verify in production
    }

    /**
     * Process webhook event based on type
     */
    private async processWebhookEvent(payload: WebhookPayload): Promise<void> {
        const { type, data } = payload;

        switch (type) {
            case 'payment.success':
            case 'checkout.completed':
                if (data.userId && data.toolId) {
                    await this.billingService.processToolPurchase(
                        data.userId,
                        data.toolId,
                        data.externalId,
                    );
                }
                break;

            case 'subscription.created':
                if (data.userId) {
                    await this.billingService.createSubscription({
                        userId: data.userId,
                        externalId: data.externalId,
                        planId: data.planId,
                        planName: data.planName,
                        periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
                        periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
                    });
                }
                break;

            case 'subscription.updated':
                if (data.externalId) {
                    await this.billingService.updateSubscription(
                        data.externalId,
                        this.mapSubscriptionStatus(data.status),
                        data.periodEnd ? new Date(data.periodEnd) : undefined,
                    );
                }
                break;

            case 'subscription.cancelled':
            case 'subscription.deleted':
                if (data.externalId) {
                    await this.billingService.cancelSubscription(data.externalId);
                }
                break;

            default:
                this.logger.warn(`Unhandled webhook event type: ${type}`);
        }
    }

    /**
     * Map external status to internal status
     */
    private mapSubscriptionStatus(status?: string): 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED' | 'TRIALING' {
        const statusMap: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED' | 'TRIALING'> = {
            active: 'ACTIVE',
            trialing: 'TRIALING',
            past_due: 'PAST_DUE',
            paused: 'PAUSED',
            cancelled: 'CANCELLED',
            canceled: 'CANCELLED',
        };

        return statusMap[status?.toLowerCase() || ''] || 'ACTIVE';
    }
}
