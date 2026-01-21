import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsGuard } from './permissions.guard';
import { ToolAccessGuard } from './tool-access.guard';

@Module({
    providers: [PermissionsService, PermissionsGuard, ToolAccessGuard],
    exports: [PermissionsService, PermissionsGuard, ToolAccessGuard],
})
export class PermissionsModule { }
