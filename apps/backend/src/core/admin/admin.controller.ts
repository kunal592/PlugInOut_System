import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AdminService, AdminToolUpdate, AdminUserToolOverride } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces';
import { UserRole, PricingType } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ============================================
    // DASHBOARD
    // ============================================

    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    async getDashboard() {
        const stats = await this.adminService.getDashboardStats();
        return {
            success: true,
            data: stats,
        };
    }

    // ============================================
    // TOOLS MANAGEMENT
    // ============================================

    @Get('tools')
    @HttpCode(HttpStatus.OK)
    async getAllTools() {
        const tools = await this.adminService.getAllTools();
        return {
            success: true,
            data: tools,
        };
    }

    @Get('tools/:slug')
    @HttpCode(HttpStatus.OK)
    async getTool(@Param('slug') slug: string) {
        const tool = await this.adminService.getToolBySlug(slug);
        return {
            success: true,
            data: tool,
        };
    }

    @Patch('tools/:slug')
    @HttpCode(HttpStatus.OK)
    async updateTool(
        @Param('slug') slug: string,
        @Body() update: AdminToolUpdate,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.updateTool(slug, update, admin.id);
        return {
            success: true,
            message: 'Tool updated successfully',
        };
    }

    @Post('tools/:slug/enable')
    @HttpCode(HttpStatus.OK)
    async enableTool(
        @Param('slug') slug: string,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.enableTool(slug, admin.id);
        return {
            success: true,
            message: 'Tool enabled successfully',
        };
    }

    @Post('tools/:slug/disable')
    @HttpCode(HttpStatus.OK)
    async disableTool(
        @Param('slug') slug: string,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.disableTool(slug, admin.id);
        return {
            success: true,
            message: 'Tool disabled successfully',
        };
    }

    @Put('tools/:slug/pricing')
    @HttpCode(HttpStatus.OK)
    async updateToolPricing(
        @Param('slug') slug: string,
        @Body() body: { price: number; pricingType: PricingType },
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.updateToolPricing(
            slug,
            body.price,
            body.pricingType,
            admin.id,
        );
        return {
            success: true,
            message: 'Tool pricing updated successfully',
        };
    }

    @Get('tools/:slug/users')
    @HttpCode(HttpStatus.OK)
    async getToolUsers(@Param('slug') slug: string) {
        const mappings = await this.adminService.getToolUserMappings(slug);
        return {
            success: true,
            data: mappings,
        };
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    @Get('users')
    @HttpCode(HttpStatus.OK)
    async getUsers(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        const result = await this.adminService.getUsers({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
        });
        return {
            success: true,
            data: result.users,
            pagination: result.pagination,
        };
    }

    @Get('users/:id')
    @HttpCode(HttpStatus.OK)
    async getUser(@Param('id') id: string) {
        const user = await this.adminService.getUserDetails(id);
        return {
            success: true,
            data: user,
        };
    }

    @Patch('users/:id/role')
    @Roles('SUPER_ADMIN') // Only super admins can change roles
    @HttpCode(HttpStatus.OK)
    async updateUserRole(
        @Param('id') id: string,
        @Body() body: { role: UserRole },
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.updateUserRole(id, body.role, admin.id);
        return {
            success: true,
            message: 'User role updated successfully',
        };
    }

    @Post('users/:id/deactivate')
    @HttpCode(HttpStatus.OK)
    async deactivateUser(
        @Param('id') id: string,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.deactivateUser(id, admin.id);
        return {
            success: true,
            message: 'User deactivated successfully',
        };
    }

    @Post('users/:id/activate')
    @HttpCode(HttpStatus.OK)
    async activateUser(
        @Param('id') id: string,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.activateUser(id, admin.id);
        return {
            success: true,
            message: 'User activated successfully',
        };
    }

    // ============================================
    // ACCESS CONTROL
    // ============================================

    @Post('access/override')
    @HttpCode(HttpStatus.OK)
    async overrideAccess(
        @Body() override: AdminUserToolOverride,
        @CurrentUser() admin: AuthenticatedUser,
    ) {
        await this.adminService.overrideUserToolAccess(override, admin.id);
        return {
            success: true,
            message: `Tool access ${override.action}ed successfully`,
        };
    }

    // ============================================
    // EVENTS / AUDIT LOG
    // ============================================

    @Get('events')
    @HttpCode(HttpStatus.OK)
    async getRecentEvents(@Query('limit') limit?: number) {
        const events = await this.adminService.getRecentEvents(
            limit ? Number(limit) : undefined,
        );
        return {
            success: true,
            data: events,
        };
    }
}
