/**
 * Encrypts allowed emails for the email-only gate (AES-256-GCM + PBKDF2).
 * Reads ALLOWLIST_CRYPTO_SECRET from src/auth/authConfig.ts (same value the app uses).
 *
 * Source file: config/allowed-emails.txt (one email per line, # comments allowed).
 * If missing, uses a built-in demo email so CI still works — copy
 * config/allowed-emails.example.txt to allowed-emails.txt for real lists.
 *
 * Usage: node scripts/encrypt-allowlist.mjs
 * Output: public/data/allowlist.enc.json
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function readSecretFromAuthConfig() {
  const p = path.join(root, 'src', 'auth', 'authConfig.ts');
  const src = fs.readFileSync(p, 'utf8');
  const m = src.match(
    /export const ALLOWLIST_CRYPTO_SECRET\s*=\s*(?:\r?\n\s*)?'((?:\\'|[^'])*)'/
  );
  if (!m) {
    throw new Error(
      'Could not parse ALLOWLIST_CRYPTO_SECRET from src/auth/authConfig.ts'
    );
  }
  return m[1].replace(/\\'/g, "'");
}

function parseEmailsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l && !l.startsWith('#'));
}

function main() {
  const secret = readSecretFromAuthConfig();
  const sourcePath = path.join(root, 'config', 'allowed-emails.txt');
  let lines = parseEmailsFromFile(sourcePath);

  if (!lines || lines.length === 0) {
    console.warn(
      'config/allowed-emails.txt missing or empty — using demo@satyverse.local only.'
    );
    lines = ['demo@satyverse.local'];
  }

  const emails = [...new Set(lines)];
  const plaintext = JSON.stringify({ v: 1, emails });

  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([enc, tag]);

  const outDir = path.join(root, 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'allowlist.enc.json');
  const bundle = {
    v: 1,
    kdf: 'PBKDF2',
    iterations: 100000,
    hash: 'SHA-256',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: combined.toString('base64'),
  };
  fs.writeFileSync(outPath, `${JSON.stringify(bundle)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${emails.length} email(s)).`);
}

main();
