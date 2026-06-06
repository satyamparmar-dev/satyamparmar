const CONTENT_PROTECTION_DISABLE_VALUES = new Set(['true', '1', 'yes']);

/** On by default (dev + prod). Set VITE_DISABLE_CONTENT_PROTECTION to true, 1, or yes to allow copy. */
export function isContentProtectionEnabled(): boolean {
  const flag = import.meta.env.VITE_DISABLE_CONTENT_PROTECTION?.trim().toLowerCase();
  return !(flag && CONTENT_PROTECTION_DISABLE_VALUES.has(flag));
}

export const CONTENT_PROTECTED_CLASS = 'app-content-protected';

/** Elements where users must still select/copy (login, search, notes). */
export function isCopyAllowedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const el = target.closest(
    'input, textarea, select, [contenteditable="true"], [data-allow-copy="true"]'
  );
  return !!el;
}
