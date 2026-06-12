import { withBasePath } from "@/lib/base-path";

const PRODUCTION_UPLOAD_API_URL =
  "https://yz1zrecbsj.execute-api.ap-southeast-1.amazonaws.com/dev/RnD/webapp/file/upload";

function resolveUploadApiUrl(): string {
  const fromEnv = import.meta.env.VITE_UPLOAD_API_URL;
  if (fromEnv) return fromEnv;
  return withBasePath("/api/upload");
}

function resolveListFilesApiUrl(): string {
  const fromEnv = import.meta.env.VITE_LIST_FILES_API_URL;
  if (fromEnv) return fromEnv;
  return withBasePath("/api/files");
}

const DEFAULT_MAX_UPLOAD_BYTES = 104_857_600;
const DEFAULT_UPLOAD_CONCURRENCY = 3;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const appConfig = {
  uploadApiUrl: resolveUploadApiUrl(),
  listFilesApiUrl: resolveListFilesApiUrl(),
  /** Direct API URL override (use when API Gateway CORS/OPTIONS is configured). */
  productionUploadApiUrl: PRODUCTION_UPLOAD_API_URL,
  maxUploadBytes: parsePositiveInt(
    import.meta.env.VITE_MAX_UPLOAD_BYTES,
    DEFAULT_MAX_UPLOAD_BYTES,
  ),
  uploadConcurrency: parsePositiveInt(
    import.meta.env.VITE_UPLOAD_CONCURRENCY,
    DEFAULT_UPLOAD_CONCURRENCY,
  ),
} as const;
