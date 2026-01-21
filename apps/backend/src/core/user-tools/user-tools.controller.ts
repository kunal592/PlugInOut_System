import {
    Controller,
    Get,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UserToolsService } from './user-tools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('user-tools')
@UseGuards(JwtAuthGuard)
export class UserToolsController {
    constructor(private readonly userToolsService: UserToolsService) { }

    /**
     * Get all tools for the current user
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async getMyTools(@CurrentUser() user: AuthenticatedUser) {
        const tools = await this.userToolsService.getUserTools(user.id);
        return {
            success: true,
            data: tools,
        };
    }

    /**
     * Get active tools for sidebar
     */
    @Get('active')
    @HttpCode(HttpStatus.OK)
    async getActiveTools(@CurrentUser() user: AuthenticatedUser) {
        const tools = await this.userToolsService.getActiveUserTools(user.id);
        return {
            success: true,
            data: tools,
        };
    }

    /**
     * Get available tools for marketplace
     */
    @Get('available')
    @HttpCode(HttpStatus.OK)
    async getAvailableTools(@CurrentUser() user: AuthenticatedUser) {
        const tools = await this.userToolsService.getAvailableTools(user.id);
        return {
            success: true,
            data: tools,
        };
    }

    /**
     * Get a specific tool for current user
     */
    @Get(':slug')
    @HttpCode(HttpStatus.OK)
    async getTool(
        @CurrentUser() user: AuthenticatedUser,
        @Param('slug') slug: string,
    ) {
        const tool = await this.userToolsService.getUserTool(user.id, slug);
        return {
            success: true,
            data: tool,
        };
    }

    /**
     * Check if user has access to a tool
     */
    @Get(':slug/access')
    @HttpCode(HttpStatus.OK)
    async checkAccess(
        @CurrentUser() user: AuthenticatedUser,
        @Param('slug') slug: string,
    ) {
        const hasAccess = await this.userToolsService.hasAccess(user.id, slug);
        return {
            success: true,
            data: { hasAccess },
        };
    }
}
