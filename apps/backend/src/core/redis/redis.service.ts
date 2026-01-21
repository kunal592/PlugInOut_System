import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis(this.configService.get<string>('REDIS_URL')!, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.error('Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
        });
    }

    async onModuleInit() {
        this.logger.log('Connecting to Redis...');
        try {
            await this.client.connect();
            this.logger.log('Redis connection established');
        } catch (error) {
            this.logger.warn('Redis connection failed, continuing without cache');
        }
    }

    async onModuleDestroy() {
        this.logger.log('Disconnecting from Redis...');
        await this.client.quit();
        this.logger.log('Redis connection closed');
    }

    /**
     * Get the raw Redis client
     */
    getClient(): Redis {
        return this.client;
    }

    /**
     * Set a value with optional TTL
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    /**
     * Get a value by key
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * Delete a key
     */
    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    /**
     * Delete keys matching a pattern
     */
    async delPattern(pattern: string): Promise<number> {
        const keys = await this.client.keys(pattern);
        if (keys.length === 0) return 0;
        return this.client.del(...keys);
    }

    /**
     * Set a JSON object
     */
    async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }

    /**
     * Get a JSON object
     */
    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    /**
     * Set expiration on a key
     */
    async expire(key: string, seconds: number): Promise<boolean> {
        const result = await this.client.expire(key, seconds);
        return result === 1;
    }

    /**
     * Publish to a channel (for pub/sub)
     */
    async publish(channel: string, message: string): Promise<number> {
        return this.client.publish(channel, message);
    }
}
