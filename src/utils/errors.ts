export function mapPresignError(status: number, body: unknown): string {
  const message = extractErrorMessage(body);
  if (message) return message;

  if (status === 400) {
    return "Invalid upload request. Check the file and try again.";
  }
  if (status === 500) {
    return "Could not generate upload URL. Please retry or contact support.";
  }
  return `Upload request failed (${status}).`;
}

export function mapS3PutError(status: number): string {
  if (status === 403) {
    return "Upload link expired. Please retry this file.";
  }
  if (status >= 500) {
    return "Storage error. Please try again later.";
  }
  return `Upload failed (${status}).`;
}

export function mapNetworkError(): string {
  return "Network error. Check your connection and try again.";
}

export function mapFetchError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Could not reach the upload API. If running locally, restart the dev server after config changes. For production, API Gateway must allow CORS (OPTIONS) from your app origin.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return mapNetworkError();
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  return null;
}
