/**
 * Environment variable loader for API package
 * 
 * Loads environment variables from multiple possible locations:
 * 1. Root .env file
 * 2. apps/web/.env file
 * 3. System environment variables (highest priority)
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Get the project root (assuming this file is in packages/api/src/lib/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../../../');

// Try to load from multiple locations
const envPaths = [
  resolve(projectRoot, '.env'),
  resolve(projectRoot, 'apps/web/.env'),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
}

// Also load from process.env (system/env vars take precedence)
// dotenv doesn't override existing env vars, so this is safe

export function ensureEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

