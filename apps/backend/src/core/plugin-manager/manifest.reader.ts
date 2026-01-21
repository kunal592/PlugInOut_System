import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

/**
 * Plugin manifest schema - strictly typed
 */
const ManifestSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    version: z.string().default('1.0.0'),
    enabled: z.boolean().default(true),
    price: z.number().int().min(0).default(0), // In cents
    pricingType: z.enum(['FREE', 'ONE_TIME', 'SUBSCRIPTION']).default('FREE'),
    routes: z.string().min(1), // e.g., "/invoice"
    permissions: z.array(z.string()).default(['USER']),
    icon: z.string().optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    homepage: z.string().url().optional(),
    repository: z.string().url().optional(),
    dependencies: z.array(z.string()).optional(), // Other plugin slugs
    minCoreVersion: z.string().optional(),
    entryPoints: z
        .object({
            backend: z.string().optional(), // e.g., "dist/module.js"
            frontend: z.string().optional(), // e.g., "dist/index.js"
        })
        .optional(),
});

export type PluginManifest = z.infer<typeof ManifestSchema>;

export interface ManifestValidationResult {
    valid: boolean;
    manifest?: PluginManifest;
    errors?: string[];
}

@Injectable()
export class ManifestReader {
    private readonly logger = new Logger(ManifestReader.name);
    private readonly manifestFileName = 'manifest.json';

    /**
     * Read and validate a manifest from a tool directory
     */
    async readManifest(toolPath: string): Promise<ManifestValidationResult> {
        const manifestPath = path.join(toolPath, this.manifestFileName);

        // Check if manifest exists
        if (!fs.existsSync(manifestPath)) {
            return {
                valid: false,
                errors: [`Manifest file not found: ${manifestPath}`],
            };
        }

        try {
            // Read manifest file
            const content = await fs.promises.readFile(manifestPath, 'utf-8');
            const rawManifest = JSON.parse(content);

            // Validate against schema
            const result = ManifestSchema.safeParse(rawManifest);

            if (!result.success) {
                const errors = result.error.errors.map(
                    (e) => `${e.path.join('.')}: ${e.message}`,
                );
                this.logger.warn(`Invalid manifest in ${toolPath}: ${errors.join(', ')}`);
                return { valid: false, errors };
            }

            return { valid: true, manifest: result.data };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to read manifest from ${toolPath}: ${message}`);
            return {
                valid: false,
                errors: [`Failed to parse manifest: ${message}`],
            };
        }
    }

    /**
     * Validate a manifest object directly
     */
    validateManifest(manifest: unknown): ManifestValidationResult {
        const result = ManifestSchema.safeParse(manifest);

        if (!result.success) {
            const errors = result.error.errors.map(
                (e) => `${e.path.join('.')}: ${e.message}`,
            );
            return { valid: false, errors };
        }

        return { valid: true, manifest: result.data };
    }

    /**
     * Get the manifest schema for documentation
     */
    getManifestSchema(): z.ZodType<PluginManifest, z.ZodTypeDef, any> {
        return ManifestSchema;
    }
}
