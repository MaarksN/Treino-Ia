import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Gamification RPC Hardening', () => {
  it('should have a migration that revokes public access and sets search_path for sensitive gamification RPCs', () => {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir);

    // Read all migrations to look for the hardening statements
    let allContent = '';
    for (const file of files) {
      if (file.endsWith('.sql')) {
        allContent += fs.readFileSync(path.join(migrationsDir, file), 'utf-8') + '\n';
      }
    }

    const functions = [
      'apply_gamification_event',
      'purchase_gamification_item',
      'open_loot_box'
    ];

    for (const fn of functions) {
      // Check if search_path is set to public (either in CREATE or ALTER)
      const searchPathRegex = new RegExp(`(ALTER FUNCTION public\\.${fn}.*SET search_path = public|create or replace function ${fn}.*SET search_path = public)`, 'i');
      expect(allContent).toMatch(searchPathRegex);

      // Check if execute is revoked from public
      const revokeRegex = new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${fn}.*FROM PUBLIC, anon, authenticated`, 'i');
      expect(allContent).toMatch(revokeRegex);

      // Check if execute is granted to service_role
      const grantRegex = new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${fn}.*TO service_role`, 'i');
      expect(allContent).toMatch(grantRegex);
    }
  });
});
