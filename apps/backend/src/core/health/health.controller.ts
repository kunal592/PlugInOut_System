import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { RedisService } from '../redis';
import { Public } from '../auth/decorators/public.decorator';

interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
    };
}

interface ServiceHealth {
    status: 'up' | 'down';
    latency?: number;
    error?: string;
}

@Controller()
export class HealthController {
    private readonly startTime = Date.now();

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    @Get('health')
    @Public()
    @HttpCode(HttpStatus.OK)
    async getHealth(): Promise<HealthStatus> {
        const [dbHealth, redisHealth] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);

        const allHealthy = dbHealth.status === 'up' && redisHealth.status === 'up';
        const allDown = dbHealth.status === 'down' && redisHealth.status === 'down';

        return {
            status: allHealthy ? 'healthy' : allDown ? 'unhealthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: dbHealth,
                redis: redisHealth,
            },
        };
    }

    @Get()
    @Public()
    @HttpCode(HttpStatus.OK)
    getRoot() {
        return {
            name: 'PlugInOut Core API',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        };
    }

    private async checkDatabase(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'up',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'down',
                error: (error as Error).message,
            };
        }
    }

    private async checkRedis(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const client = this.redis.getClient();
            await client.ping();
            return {
                status: 'up',
                latency: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'down',
                error: (error as Error).message,
            };
        }
    }
}
