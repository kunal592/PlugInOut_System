import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma';
import { RedisService } from '../redis';
import { EventInput, DomainEvent, EventType, EventSubscriber } from './event.types';

@Injectable()
export class EventPublisher {
    private readonly logger = new Logger(EventPublisher.name);
    private readonly subscribers: Map<EventType, EventSubscriber[]> = new Map();

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    /**
     * Register an event subscriber
     */
    subscribe(subscriber: EventSubscriber): void {
        const eventTypes = subscriber.subscribedTo();
        for (const eventType of eventTypes) {
            const existing = this.subscribers.get(eventType) || [];
            existing.push(subscriber);
            this.subscribers.set(eventType, existing);
            this.logger.debug(`Subscriber registered for: ${eventType}`);
        }
    }

    /**
     * Publish an event - persists to event store and notifies subscribers
     */
    async publish(input: EventInput): Promise<DomainEvent> {
        const event: DomainEvent = {
            ...input,
            id: uuidv4(),
            version: input.version || '1.0',
            timestamp: new Date(),
        };

        // Persist to event store (append-only)
        await this.persistEvent(event);

        // Notify local subscribers
        await this.notifySubscribers(event);

        // Publish to Redis for distributed systems (Kafka-ready abstraction)
        await this.publishToChannel(event);

        this.logger.log(`Event published: ${event.type} (${event.id})`);

        return event;
    }

    /**
     * Publish multiple events atomically
     */
    async publishBatch(inputs: EventInput[]): Promise<DomainEvent[]> {
        const events: DomainEvent[] = inputs.map((input) => ({
            ...input,
            id: uuidv4(),
            version: input.version || '1.0',
            timestamp: new Date(),
        }));

        // Persist all events in a transaction
        await this.prisma.$transaction(
            events.map((event) =>
                this.prisma.event.create({
                    data: {
                        id: event.id,
                        type: event.type,
                        version: event.version,
                        aggregateType: event.aggregateType,
                        aggregateId: event.aggregateId,
                        userId: event.userId,
                        payload: event.payload as any,
                        createdAt: event.timestamp,
                    },
                }),
            ),
        );

        // Notify subscribers for each event
        for (const event of events) {
            await this.notifySubscribers(event);
            await this.publishToChannel(event);
        }

        this.logger.log(`Batch of ${events.length} events published`);

        return events;
    }

    /**
     * Replay events for an aggregate (for rebuilding state)
     */
    async getEventsForAggregate(
        aggregateType: string,
        aggregateId: string,
    ): Promise<DomainEvent[]> {
        const events = await this.prisma.event.findMany({
            where: {
                aggregateType,
                aggregateId,
            },
            orderBy: { createdAt: 'asc' },
        });

        return events.map((e) => ({
            id: e.id,
            type: e.type as EventType,
            version: e.version,
            aggregateType: e.aggregateType || undefined,
            aggregateId: e.aggregateId || undefined,
            userId: e.userId || undefined,
            payload: e.payload as Record<string, unknown>,
            timestamp: e.createdAt,
        }));
    }

    /**
     * Persist event to database
     */
    private async persistEvent(event: DomainEvent): Promise<void> {
        await this.prisma.event.create({
            data: {
                id: event.id,
                type: event.type,
                version: event.version,
                aggregateType: event.aggregateType,
                aggregateId: event.aggregateId,
                userId: event.userId,
                payload: event.payload as any,
                createdAt: event.timestamp,
            },
        });
    }

    /**
     * Notify local subscribers
     */
    private async notifySubscribers(event: DomainEvent): Promise<void> {
        const subscribers = this.subscribers.get(event.type as EventType) || [];

        for (const subscriber of subscribers) {
            try {
                await subscriber.onEvent(event);
            } catch (error) {
                this.logger.error(
                    `Subscriber failed for ${event.type}: ${error}`,
                    (error as Error).stack,
                );
                // In production, might want to send to dead letter queue
            }
        }
    }

    /**
     * Publish to Redis channel (abstraction for Kafka migration)
     */
    private async publishToChannel(event: DomainEvent): Promise<void> {
        try {
            const channel = `events:${event.type}`;
            await this.redis.publish(channel, JSON.stringify(event));
        } catch (error) {
            this.logger.warn(`Failed to publish to Redis channel: ${error}`);
            // Non-critical - local subscribers already notified
        }
    }
}
