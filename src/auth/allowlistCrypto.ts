import { ALLOWLIST_CRYPTO_SECRET } from './authConfig';

export interface AllowlistBundle {
  v: number;
  kdf: string;
  iterations: number;
  hash: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export async function decryptAllowlistEmails(bundle: AllowlistBundle): Promise<string[]> {
  if (bundle.v !== 1 || bundle.kdf !== 'PBKDF2' || bundle.hash !== 'SHA-256') {
    throw new Error('Unsupported allowlist format');
  }

  const salt = b64ToBuf(bundle.salt);
  const iv = b64ToBuf(bundle.iv);
  const combined = new Uint8Array(b64ToBuf(bundle.ciphertext));

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(ALLOWLIST_CRYPTO_SECRET),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: bundle.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    aesKey,
    combined
  );

  const text = new TextDecoder().decode(decrypted);
  const parsed = JSON.parse(text) as { v?: number; emails?: string[] };
  if (!Array.isArray(parsed.emails)) {
    throw new Error('Invalid allowlist payload');
  }

  return parsed.emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
}

export async function fetchAllowlistBundle(baseUrl: string): Promise<AllowlistBundle> {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const res = await fetch(`${base}data/allowlist.enc.json`);
  if (!res.ok) {
    throw new Error(`Allowlist fetch failed (${res.status})`);
  }
  return (await res.json()) as AllowlistBundle;
}
