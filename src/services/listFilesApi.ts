import { appConfig } from "@/config";
import type { S3FileObject } from "@/types/s3File";
import { mapFetchError } from "@/utils/errors";

interface RawS3File {
  filename?: string;
  key?: string;
  name?: string;
  size?: number;
  last_modified?: string;
  lastModified?: string;
}

interface ListFilesResponse {
  files?: RawS3File[];
}

function normalizeFile(raw: RawS3File): S3FileObject | null {
  const filename = raw.filename ?? raw.key ?? raw.name;
  if (!filename || typeof raw.size !== "number") return null;

  const lastModified = raw.last_modified ?? raw.lastModified ?? "";
  return { filename, size: raw.size, lastModified };
}

function sortNewestFirst(files: S3FileObject[]): S3FileObject[] {
  return [...files].sort((a, b) => {
    const aTime = Date.parse(a.lastModified) || 0;
    const bTime = Date.parse(b.lastModified) || 0;
    return bTime - aTime;
  });
}

export async function fetchS3FileList(): Promise<S3FileObject[]> {
  let response: Response;
  try {
    response = await fetch(appConfig.listFilesApiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new Error(mapFetchError(error));
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Could not load bucket files (${response.status}).`;
    throw new Error(message);
  }

  const payload = body as ListFilesResponse | RawS3File[];
  const rawFiles = Array.isArray(payload) ? payload : (payload.files ?? []);

  return sortNewestFirst(
    rawFiles
      .map(normalizeFile)
      .filter((file): file is S3FileObject => file !== null),
  );
}
