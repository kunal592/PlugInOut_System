import { Module, OnModuleInit } from '@nestjs/common';
import { PluginLoader } from './plugin.loader';
import { ManifestReader } from './manifest.reader';
import { PluginRegistry } from './plugin.registry';
import { ToolsController } from './tools.controller';

@Module({
    controllers: [ToolsController],
    providers: [PluginLoader, ManifestReader, PluginRegistry],
    exports: [PluginRegistry, ManifestReader],
})
export class PluginModule implements OnModuleInit {
    constructor(private readonly pluginLoader: PluginLoader) { }

    async onModuleInit() {
        // Load all plugins on startup
        await this.pluginLoader.loadAllPlugins();
    }
}
