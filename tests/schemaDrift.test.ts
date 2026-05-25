import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type UsageKind = 'table' | 'rpc';

interface Usage {
  kind: UsageKind;
  name: string;
  file: string;
}

const ROOT = process.cwd();
const SOURCE_DIRS = ['src', 'api', 'tests'];
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');
const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const ALLOWLIST: Record<string, string> = {
  'table:auth.users': 'Supabase managed auth schema, not an application migration.',
  'table:users': 'Supabase auth shorthand if referenced by generated code.',
};

function walkFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;

    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walkFiles(fullPath, files);
      continue;
    }

    if (/\.(cjs|mjs|js|jsx|ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function toProjectPath(file: string): string {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function collectUsages(): Usage[] {
  const usages: Usage[] = [];
  const sourceFiles = SOURCE_DIRS.flatMap(dir => walkFiles(path.join(ROOT, dir)));

  for (const file of sourceFiles) {
    const source = stripComments(readFileSync(file, 'utf8'));
    const projectPath = toProjectPath(file);
    let match: RegExpExecArray | null;

    const fromPattern = /\.from\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = fromPattern.exec(source))) {
      usages.push({ kind: 'table', name: match[1], file: projectPath });
    }

    const rpcPattern = /\.rpc\(\s*['"]([^'"]+)['"]\s*(?:,|\))/g;
    while ((match = rpcPattern.exec(source))) {
      usages.push({ kind: 'rpc', name: match[1], file: projectPath });
    }
  }

  return usages;
}

function collectDefinitions() {
  const tables = new Set<string>();
  const rpcs = new Set<string>();
  const views = new Set<string>();

  if (!existsSync(MIGRATIONS_DIR)) {
    return { tables, rpcs, views };
  }

  for (const file of readdirSync(MIGRATIONS_DIR).filter(item => item.endsWith('.sql'))) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    let match: RegExpExecArray | null;

    const createTablePattern = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
    while ((match = createTablePattern.exec(sql))) {
      tables.add(match[1].toLowerCase());
    }

    const createFunctionPattern = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
    while ((match = createFunctionPattern.exec(sql))) {
      rpcs.add(match[1].toLowerCase());
    }

    const createViewPattern = /create\s+(?:or\s+replace\s+)?view\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
    while ((match = createViewPattern.exec(sql))) {
      views.add(match[1].toLowerCase());
    }
  }

  return { tables, rpcs, views };
}

function formatMissing(usages: Usage[]): string[] {
  const grouped = new Map<string, Set<string>>();

  for (const usage of usages) {
    const key = `${usage.kind}:${usage.name}`;
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key)?.add(usage.file);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, files]) => `${key} used in ${Array.from(files).sort().join(', ')}`);
}

describe('schema drift guard', () => {
  it('keeps Supabase table/RPC usages backed by versioned migrations', () => {
    const definitions = collectDefinitions();
    const missing = collectUsages().filter(usage => {
      const key = `${usage.kind}:${usage.name}`;
      if (ALLOWLIST[key]) return false;

      const normalized = usage.name.toLowerCase();
      if (usage.kind === 'table') {
        return !definitions.tables.has(normalized) && !definitions.views.has(normalized);
      }

      return !definitions.rpcs.has(normalized);
    });

    expect(formatMissing(missing)).toEqual([]);
  });

  it('keeps allowlist entries justified inline', () => {
    for (const [key, reason] of Object.entries(ALLOWLIST)) {
      expect(key).toMatch(/^(table|rpc):[a-zA-Z0-9_.-]+$/);
      expect(reason.trim().length).toBeGreaterThanOrEqual(12);
    }
  });
});
