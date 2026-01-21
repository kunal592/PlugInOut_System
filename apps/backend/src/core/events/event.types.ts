/**
 * Event Types - Versioned and strictly typed
 * All events in the system MUST be defined here
 */
export const EventTypes = {
    // User Events
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_LOGGED_IN: 'user.logged_in',
    USER_LOGGED_OUT: 'user.logged_out',

    // Tool Events
    TOOL_REGISTERED: 'tool.registered',
    TOOL_ENABLED: 'tool.enabled',
    TOOL_DISABLED: 'tool.disabled',
    TOOL_UPDATED: 'tool.updated',

    // Billing Events (Abstract)
    TOOL_PURCHASED: 'billing.tool_purchased',
    TOOL_ACTIVATED: 'billing.tool_activated',
    TOOL_EXPIRED: 'billing.tool_expired',
    SUBSCRIPTION_CREATED: 'billing.subscription_created',
    SUBSCRIPTION_UPDATED: 'billing.subscription_updated',
    SUBSCRIPTION_CANCELLED: 'billing.subscription_cancelled',
    PAYMENT_RECEIVED: 'billing.payment_received',
    PAYMENT_FAILED: 'billing.payment_failed',

    // Access Events
    TOOL_ACCESS_GRANTED: 'access.tool_granted',
    TOOL_ACCESS_REVOKED: 'access.tool_revoked',
    TOOL_ACCESS_EXPIRED: 'access.tool_expired',

    // Admin Events
    ADMIN_TOOL_TOGGLE: 'admin.tool_toggle',
    ADMIN_PRICE_CHANGE: 'admin.price_change',
    ADMIN_ACCESS_OVERRIDE: 'admin.access_override',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

/**
 * Base event payload interface
 */
export interface BaseEventPayload {
    [key: string]: unknown;
}

/**
 * Event creation input
 */
export interface EventInput {
    type: EventType;
    version?: string;
    aggregateType?: string;
    aggregateId?: string;
    userId?: string;
    payload: BaseEventPayload;
}

/**
 * Full event with metadata
 */
export interface DomainEvent extends EventInput {
    id: string;
    timestamp: Date;
}

/**
 * Event handler interface
 */
export interface EventHandler {
    handle(event: DomainEvent): Promise<void>;
}

/**
 * Event subscriber interface
 */
export interface EventSubscriber {
    subscribedTo(): EventType[];
    onEvent(event: DomainEvent): Promise<void>;
}
