import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';

const here = dirname(fileURLToPath(import.meta.url));
const seedSql = readFileSync(join(here, '..', '..', 'database', 'seed.sql'), 'utf8');

// The login page advertises the demo account as demo@dotnetforge.dev / forge1234.
// Guard that the seeded bcrypt hash actually matches that password.
test('seeded demo account hash matches the documented password', () => {
  const row = seedSql.match(/'demo@dotnetforge\.dev',\s*'[^']*',\s*'(\$2[aby]\$[^']+)'/);
  assert.ok(row, 'demo account row not found in seed.sql');

  const hash = row[1];
  assert.equal(bcrypt.compareSync('forge1234', hash), true,
    'seed.sql demo hash does not verify against "forge1234"');
  assert.equal(bcrypt.compareSync('wrong-password', hash), false);
});
