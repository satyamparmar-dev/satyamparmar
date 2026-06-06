import CryptoJS from 'crypto-js';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const DEV_FALLBACK_SECRET = 'satyverse-dev-key-2024';

let warnedMissingEnvSecret = false;

function deriveAesPassphrase(): string {
  const fromEnv = import.meta.env.VITE_STORAGE_SECRET;
  if (!fromEnv && !warnedMissingEnvSecret) {
    warnedMissingEnvSecret = true;
    console.warn(
      '[Satyverse] VITE_STORAGE_SECRET is not set; using a dev-only fallback for encrypted localStorage.'
    );
  }
  const secret = fromEnv ?? DEV_FALLBACK_SECRET;
  return CryptoJS.SHA256(secret).toString();
}

export const STORAGE_DECRYPT_FAILED_EVENT = 'satyverse-storage-decrypt-failed';

function notifyDecryptFailed(storageKey: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_DECRYPT_FAILED_EVENT, { detail: { key: storageKey } })
  );
}

function parseStorageValueJson(plain: string): StorageValue<unknown> | null {
  try {
    const v = JSON.parse(plain) as unknown;
    if (typeof v !== 'object' || v === null || !('state' in v)) return null;
    const rec = v as { state: unknown; version?: unknown };
    if (typeof rec.state !== 'object' || rec.state === null) return null;
    return v as StorageValue<unknown>;
  } catch {
    return null;
  }
}

/**
 * Zustand v4.5+ persist storage: encrypts the JSON blob for {@link StorageValue}
 * (same shape as `createJSONStorage` would write to disk, but ciphertext in localStorage).
 */
export const encryptedPersistStorage: PersistStorage<unknown> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (raw === null) return null;

      const key = deriveAesPassphrase();
      const decrypted = CryptoJS.AES.decrypt(raw, key).toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        localStorage.removeItem(name);
        notifyDecryptFailed(name);
        return null;
      }

      const parsed = parseStorageValueJson(decrypted);
      if (!parsed) {
        localStorage.removeItem(name);
        notifyDecryptFailed(name);
        return null;
      }
      return parsed;
    } catch {
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
      notifyDecryptFailed(name);
      return null;
    }
  },

  setItem: (name, value) => {
    const key = deriveAesPassphrase();
    const plain = JSON.stringify(value);
    const ciphertext = CryptoJS.AES.encrypt(plain, key).toString();
    localStorage.setItem(name, ciphertext);
  },

  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};
