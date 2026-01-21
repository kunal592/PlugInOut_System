import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EventPublisher } from '../events/event.publisher';
import { EventTypes } from '../events/event.types';
import { PluginManifest } from './manifest.reader';
import { PricingType, UserRole } from '@prisma/client';

export interface RegisteredPlugin {
    id: string;
    slug: string;
    name: string;
    description?: string;
    version: string;
    enabled: boolean;
    basePrice: number;
    pricingType: PricingType;
    currency: string;
    routes: string;
    permissions: UserRole[];
    icon?: string;
    category?: string;
    registeredAt: Date;
}

@Injectable()
export class PluginRegistry {
    private readonly logger = new Logger(PluginRegistry.name);
    private readonly plugins: Map<string, RegisteredPlugin> = new Map();

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventPublisher: EventPublisher,
    ) { }

    /**
     * Register a plugin from manifest
     */
    async register(manifest: PluginManifest): Promise<RegisteredPlugin> {
        this.logger.log(`Registering plugin: ${manifest.slug}`);

        // Map string permissions to UserRole enum
        const permissions: UserRole[] = manifest.permissions.map(p => {
            const role = p.toUpperCase() as keyof typeof UserRole;
            if (UserRole[role]) return UserRole[role];
            return UserRole.USER; // Default fallback
        });

        // Upsert to database
        const tool = await this.prisma.tool.upsert({
            where: { slug: manifest.slug },
            update: {
                name: manifest.name,
                description: manifest.description,
                version: manifest.version,
                enabled: manifest.enabled,
                basePrice: manifest.price, // Mapping price to basePrice
                pricingType: manifest.pricingType as PricingType,
                routes: manifest.routes,
                permissions: permissions,
                icon: manifest.icon,
                category: manifest.category,
            },
            create: {
                slug: manifest.slug,
                name: manifest.name,
                description: manifest.description,
                version: manifest.version,
                enabled: manifest.enabled,
                basePrice: manifest.price, // Mapping price to basePrice
                pricingType: manifest.pricingType as PricingType,
                routes: manifest.routes,
                permissions: permissions,
                icon: manifest.icon,
                category: manifest.category,
            },
        });

        const registeredPlugin: RegisteredPlugin = {
            id: tool.id,
            slug: tool.slug,
            name: tool.name,
            description: tool.description || undefined,
            version: tool.version,
            enabled: tool.enabled,
            basePrice: tool.basePrice,
            pricingType: tool.pricingType,
            currency: tool.currency,
            routes: tool.routes,
            permissions: tool.permissions,
            icon: tool.icon || undefined,
            category: tool.category || undefined,
            registeredAt: tool.createdAt,
        };

        // Store in memory cache
        this.plugins.set(manifest.slug, registeredPlugin);

        // Emit registration event
        await this.eventPublisher.publish({
            type: EventTypes.TOOL_REGISTERED,
            aggregateType: 'Tool',
            aggregateId: tool.id,
            payload: {
                slug: manifest.slug,
                name: manifest.name,
                version: manifest.version,
            },
        });

        this.logger.log(`Plugin registered: ${manifest.slug} (${tool.id})`);
        return registeredPlugin;
    }

    /**
     * Get a plugin by slug
     */
    get(slug: string): RegisteredPlugin | undefined {
        return this.plugins.get(slug);
    }

    /**
     * Get a plugin by slug from database
     */
    async getBySlug(slug: string): Promise<RegisteredPlugin | null> {
        const tool = await this.prisma.tool.findUnique({
            where: { slug },
        });

        if (!tool) return null;

        return {
            id: tool.id,
            slug: tool.slug,
            name: tool.name,
            description: tool.description || undefined,
            version: tool.version,
            enabled: tool.enabled,
            basePrice: tool.basePrice,
            pricingType: tool.pricingType,
            currency: tool.currency,
            routes: tool.routes,
            permissions: tool.permissions,
            icon: tool.icon || undefined,
            category: tool.category || undefined,
            registeredAt: tool.createdAt,
        };
    }

    /**
     * Get all registered plugins
     */
    getAll(): RegisteredPlugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Get all enabled plugins
     */
    getEnabled(): RegisteredPlugin[] {
        return this.getAll().filter((p) => p.enabled);
    }

    /**
     * Get all plugins from database
     */
    async getAllFromDb(): Promise<RegisteredPlugin[]> {
        const tools = await this.prisma.tool.findMany({
            orderBy: { name: 'asc' },
        });

        return tools.map((tool) => ({
            id: tool.id,
            slug: tool.slug,
            name: tool.name,
            description: tool.description || undefined,
            version: tool.version,
            enabled: tool.enabled,
            basePrice: tool.basePrice,
            pricingType: tool.pricingType,
            currency: tool.currency,
            routes: tool.routes,
            permissions: tool.permissions,
            icon: tool.icon || undefined,
            category: tool.category || undefined,
            registeredAt: tool.createdAt,
        }));
    }

    /**
     * Check if a plugin is registered
     */
    has(slug: string): boolean {
        return this.plugins.has(slug);
    }

    /**
     * Enable a plugin
     */
    async enable(slug: string): Promise<void> {
        await this.prisma.tool.update({
            where: { slug },
            data: { enabled: true },
        });

        const plugin = this.plugins.get(slug);
        if (plugin) {
            plugin.enabled = true;
        }

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_ENABLED,
            aggregateType: 'Tool',
            aggregateId: plugin?.id,
            payload: { slug },
        });

        this.logger.log(`Plugin enabled: ${slug}`);
    }

    /**
     * Disable a plugin
     */
    async disable(slug: string): Promise<void> {
        await this.prisma.tool.update({
            where: { slug },
            data: { enabled: false },
        });

        const plugin = this.plugins.get(slug);
        if (plugin) {
            plugin.enabled = false;
        }

        await this.eventPublisher.publish({
            type: EventTypes.TOOL_DISABLED,
            aggregateType: 'Tool',
            aggregateId: plugin?.id,
            payload: { slug },
        });

        this.logger.log(`Plugin disabled: ${slug}`);
    }

    /**
     * Remove a plugin from registry (not from database)
     */
    unregister(slug: string): boolean {
        return this.plugins.delete(slug);
    }

    /**
     * Reload plugins from database
     */
    async reloadFromDb(): Promise<void> {
        this.plugins.clear();

        const tools = await this.prisma.tool.findMany();

        for (const tool of tools) {
            this.plugins.set(tool.slug, {
                id: tool.id,
                slug: tool.slug,
                name: tool.name,
                description: tool.description || undefined,
                version: tool.version,
                enabled: tool.enabled,
                basePrice: tool.basePrice,
                pricingType: tool.pricingType,
                currency: tool.currency,
                routes: tool.routes,
                permissions: tool.permissions,
                icon: tool.icon || undefined,
                category: tool.category || undefined,
                registeredAt: tool.createdAt,
            });
        }

        this.logger.log(`Reloaded ${this.plugins.size} plugins from database`);
    }
}
