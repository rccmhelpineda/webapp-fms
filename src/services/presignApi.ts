import { appConfig } from "@/config";
import type { PresignResponse } from "@/types/upload";
import { getFileBasename, getFileContentType } from "@/utils/filename";
import { mapFetchError, mapPresignError } from "@/utils/errors";

export async function requestPresignUrl(file: File): Promise<PresignResponse> {
  const filename = getFileBasename(file.name);
  const filetype = getFileContentType(file);

  let response: Response;
  try {
    response = await fetch(appConfig.uploadApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, filetype }),
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
    throw new Error(mapPresignError(response.status, body));
  }

  const data = body as Partial<PresignResponse>;
  if (!data.upload_url || !data.filename) {
    throw new Error("Invalid response from upload API.");
  }

  return {
    upload_url: data.upload_url,
    filename: data.filename,
  };
}
