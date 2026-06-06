/**
 * Regenerate password hash/salt for entries in permanentUserSeed.ts
 * Usage: node scripts/generate-permanent-user-seed.mjs [password]
 * Env: VITE_APP_SECRET (optional, same as Vite app)
 */
import crypto from 'crypto';

const APP_SECRET = process.env.VITE_APP_SECRET || 'satyverse-dev-fallback-secret-v1';
const password = process.argv[2] || 'Test@1234';

function sha256(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function hashPassword(pw, salt) {
  const round1 = sha256(pw + salt);
  return sha256(round1 + salt + APP_SECRET);
}

const salt = crypto.randomBytes(32).toString('hex');
const passwordHash = hashPassword(password, salt);

console.log('Add to permanentUserSeed.ts:');
console.log(JSON.stringify({ salt, passwordHash }, null, 2));
