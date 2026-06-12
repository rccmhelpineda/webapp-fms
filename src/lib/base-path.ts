/**
 * Subpath on handrian.space (no trailing slash).
 * Must match `BASE_PATH` in `vite.config.ts` and `vercel.json` rewrites.
 */
export const BASE_PATH = "/demo/fms";

export function withBasePath(path: string): string {
  if (path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
