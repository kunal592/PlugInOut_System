import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Core Modules
import { CoreConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { LoggerModule } from './core/logger/logger.module';
import { AuthModule } from './core/auth/auth.module';
import { BillingModule } from './core/billing/billing.module';
import { PluginModule } from './core/plugin-manager/plugin.module';
import { PermissionsModule } from './core/permissions/permissions.module';
import { UserToolsModule } from './core/user-tools/user-tools.module';
import { AdminModule } from './core/admin/admin.module';
import { EventsModule } from './core/events/events.module';
import { HealthModule } from './core/health/health.module';

// Environment validation
import { envValidation } from './core/config/env.validation';

@Module({
    imports: [
        // Global configuration
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            validate: envValidation,
            envFilePath: ['../../.env', '.env'],
        }),

        // Core infrastructure modules
        CoreConfigModule,
        PrismaModule,
        RedisModule,
        LoggerModule,

        // Core feature modules
        AuthModule,
        BillingModule,
        PluginModule,
        PermissionsModule,
        UserToolsModule,
        AdminModule,
        EventsModule,
        HealthModule,
    ],
})
export class AppModule { }
