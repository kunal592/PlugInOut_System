import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';
import { AuthenticatedUser } from '../auth/interfaces';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionsService: PermissionsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no permissions required, allow
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUser;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has admin role for admin-only permissions
        if (requiredPermissions.includes('ADMIN')) {
            const isAdmin = await this.permissionsService.isAdmin(user.id);
            if (!isAdmin) {
                throw new ForbiddenException('Admin access required');
            }
        }

        if (requiredPermissions.includes('SUPER_ADMIN')) {
            const isSuperAdmin = await this.permissionsService.isSuperAdmin(user.id);
            if (!isSuperAdmin) {
                throw new ForbiddenException('Super admin access required');
            }
        }

        return true;
    }
}
