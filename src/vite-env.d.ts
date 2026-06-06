/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORAGE_SECRET?: string;
  /** Set to true, 1, or yes to allow copy (protection is on by default) */
  readonly VITE_DISABLE_CONTENT_PROTECTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
