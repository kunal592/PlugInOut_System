import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ManifestReader, PluginManifest } from './manifest.reader';
import { PluginRegistry, RegisteredPlugin } from './plugin.registry';

interface LoadResult {
    loaded: RegisteredPlugin[];
    failed: Array<{ path: string; errors: string[] }>;
}

@Injectable()
export class PluginLoader {
    private readonly logger = new Logger(PluginLoader.name);
    private readonly toolsDirectory: string;

    constructor(
        private readonly manifestReader: ManifestReader,
        private readonly registry: PluginRegistry,
    ) {
        // Tools directory relative to project root
        this.toolsDirectory = path.resolve(process.cwd(), '../../tools');
    }

    /**
     * Load all plugins from the tools directory
     */
    async loadAllPlugins(): Promise<LoadResult> {
        this.logger.log('Starting plugin discovery...');

        const result: LoadResult = {
            loaded: [],
            failed: [],
        };

        // Check if tools directory exists
        if (!fs.existsSync(this.toolsDirectory)) {
            this.logger.warn(`Tools directory not found: ${this.toolsDirectory}`);
            this.logger.log('Creating tools directory...');
            await fs.promises.mkdir(this.toolsDirectory, { recursive: true });
            return result;
        }

        // Find all tool directories
        const toolDirs = await this.discoverToolDirectories();

        this.logger.log(`Found ${toolDirs.length} potential tools`);

        // Load each tool
        for (const toolDir of toolDirs) {
            try {
                const plugin = await this.loadPlugin(toolDir);
                if (plugin) {
                    result.loaded.push(plugin);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to load plugin from ${toolDir}: ${message}`);
                result.failed.push({ path: toolDir, errors: [message] });
            }
        }

        this.logger.log(
            `Plugin loading complete: ${result.loaded.length} loaded, ${result.failed.length} failed`,
        );

        return result;
    }

    /**
     * Load a single plugin from a directory
     */
    async loadPlugin(toolPath: string): Promise<RegisteredPlugin | null> {
        const toolName = path.basename(toolPath);
        this.logger.debug(`Loading plugin: ${toolName}`);

        // Read and validate manifest
        const { valid, manifest, errors } =
            await this.manifestReader.readManifest(toolPath);

        if (!valid || !manifest) {
            this.logger.warn(`Invalid manifest for ${toolName}: ${errors?.join(', ')}`);
            return null;
        }

        // Skip disabled plugins
        if (!manifest.enabled) {
            this.logger.debug(`Skipping disabled plugin: ${manifest.slug}`);
            return null;
        }

        // Register the plugin
        return this.registry.register(manifest);
    }

    /**
     * Reload a specific plugin
     */
    async reloadPlugin(slug: string): Promise<RegisteredPlugin | null> {
        const toolPath = path.join(this.toolsDirectory, slug);

        if (!fs.existsSync(toolPath)) {
            this.logger.warn(`Tool directory not found: ${toolPath}`);
            return null;
        }

        // Unregister existing
        this.registry.unregister(slug);

        // Load fresh
        return this.loadPlugin(toolPath);
    }

    /**
     * Reload all plugins
     */
    async reloadAllPlugins(): Promise<LoadResult> {
        // Clear registry
        const currentPlugins = this.registry.getAll();
        for (const plugin of currentPlugins) {
            this.registry.unregister(plugin.slug);
        }

        // Load fresh
        return this.loadAllPlugins();
    }

    /**
     * Discover all tool directories
     */
    private async discoverToolDirectories(): Promise<string[]> {
        try {
            // Find directories containing manifest.json
            const pattern = path.join(this.toolsDirectory, '*', 'manifest.json');
            const manifests = await glob(pattern);

            // Get parent directories
            return manifests.map((m) => path.dirname(m));
        } catch (error) {
            this.logger.error(`Failed to discover tools: ${error}`);
            return [];
        }
    }

    /**
     * Get the tools directory path
     */
    getToolsDirectory(): string {
        return this.toolsDirectory;
    }

    /**
     * Check if a tool directory exists
     */
    toolExists(slug: string): boolean {
        const toolPath = path.join(this.toolsDirectory, slug);
        return fs.existsSync(toolPath);
    }

    /**
     * Get tool manifest without registering
     */
    async getToolManifest(slug: string): Promise<PluginManifest | null> {
        const toolPath = path.join(this.toolsDirectory, slug);

        if (!fs.existsSync(toolPath)) {
            return null;
        }

        const { valid, manifest } = await this.manifestReader.readManifest(toolPath);
        return valid && manifest ? manifest : null;
    }
}
