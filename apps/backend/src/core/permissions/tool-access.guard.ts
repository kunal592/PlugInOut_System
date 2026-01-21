import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthenticatedUser } from '../auth/interfaces';

/**
 * Guard that checks if user has access to a specific tool
 * Requires X-Tool-Slug header or toolSlug in request params
 */
@Injectable()
export class ToolAccessGuard implements CanActivate {
    constructor(private readonly permissionsService: PermissionsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUser;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Get tool slug from header or params
        const toolSlug =
            request.headers['x-tool-slug'] ||
            request.params.toolSlug ||
            request.params.slug;

        if (!toolSlug) {
            throw new ForbiddenException('Tool slug not provided');
        }

        const result = await this.permissionsService.canAccessTool({
            userId: user.id,
            toolSlug,
        });

        if (!result.allowed) {
            throw new ForbiddenException(result.reason || 'Access denied');
        }

        // Inject tool slug into request for downstream use
        request.toolSlug = toolSlug;

        return true;
    }
}
