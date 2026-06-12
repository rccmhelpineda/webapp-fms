export function getFileBasename(name: string): string {
  const normalized = name.replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || name;
}

export function getFileContentType(file: File): string {
  return file.type || "application/octet-stream";
}
