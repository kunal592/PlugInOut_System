import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PluginRegistry } from '../plugin-manager/plugin.registry';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tools')
export class ToolsController {
    constructor(private readonly registry: PluginRegistry) { }

    /**
     * Get all public tools (for marketplace)
     */
    @Get()
    @Public()
    @HttpCode(HttpStatus.OK)
    async getAllTools() {
        const tools = await this.registry.getAllFromDb();

        // Filter to only public and enabled tools
        const publicTools = tools.filter((t) => t.enabled);

        return {
            success: true,
            data: publicTools.map((tool) => ({
                slug: tool.slug,
                name: tool.name,
                description: tool.description,
                price: tool.price,
                pricingType: tool.pricingType,
                icon: tool.icon,
                category: tool.category,
                routes: tool.routes,
            })),
        };
    }

    /**
     * Get tool details by slug
     */
    @Get(':slug')
    @Public()
    @HttpCode(HttpStatus.OK)
    async getTool(@Param('slug') slug: string) {
        const tool = await this.registry.getBySlug(slug);

        if (!tool || !tool.enabled) {
            return {
                success: false,
                error: 'Tool not found',
            };
        }

        return {
            success: true,
            data: {
                slug: tool.slug,
                name: tool.name,
                description: tool.description,
                version: tool.version,
                price: tool.price,
                pricingType: tool.pricingType,
                icon: tool.icon,
                category: tool.category,
                routes: tool.routes,
                permissions: tool.permissions,
            },
        };
    }
}
