import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CI workflow', () => {
  const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf-8');

  it('runs quality gates in separate jobs so GitHub Actions can parallelize them', () => {
    expect(workflow).toContain('  lint:');
    expect(workflow).toContain('  typecheck:');
    expect(workflow).toContain('  test:');
    expect(workflow).toContain('  build:');
    expect(workflow).toContain('run: npm run lint');
    expect(workflow).toContain('run: npm run typecheck');
    expect(workflow).toContain('run: npm test');
    expect(workflow).toContain('run: npm run build');
  });
});
