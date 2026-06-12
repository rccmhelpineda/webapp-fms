/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPLOAD_API_URL?: string;
  readonly VITE_LIST_FILES_API_URL?: string;
  readonly VITE_MAX_UPLOAD_BYTES?: string;
  readonly VITE_UPLOAD_CONCURRENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
