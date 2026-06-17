#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const maxBytes = Number(process.env.MAX_BUNDLE_BYTES ?? 7 * 1024 * 1024);
const trackedExtensions = new Set(['.css', '.html', '.js', '.mjs']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function extensionOf(path) {
  const match = path.match(/\.[^.]+$/);
  return match?.[0] ?? '';
}

const files = walk(distDir).filter((path) => trackedExtensions.has(extensionOf(path)));
const totalBytes = files.reduce((sum, path) => sum + statSync(path).size, 0);
const maxMiB = (maxBytes / 1024 / 1024).toFixed(2);
const totalMiB = (totalBytes / 1024 / 1024).toFixed(2);

console.log(`Bundle size: ${totalMiB} MiB / ${maxMiB} MiB`);

if (totalBytes > maxBytes) {
  console.error(
    `Bundle size gate failed: ${totalBytes} bytes exceeds MAX_BUNDLE_BYTES=${maxBytes}.`,
  );
  process.exitCode = 1;
}
