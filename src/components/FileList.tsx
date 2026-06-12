import { Button, ProgressBar, Spinner } from "@heroui/react";

import type { SelectedFile } from "@/types/upload";
import { formatFileSize } from "@/utils/bytes";
import { getFileBasename } from "@/utils/filename";
import { appConfig } from "@/config";

interface FileListProps {
  files: SelectedFile[];
  isUploading: boolean;
  onRemove: (id: string) => void;
}

function statusLabel(status: SelectedFile["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "presigning":
      return "Preparing…";
    case "uploading":
      return "Uploading";
    case "success":
      return "Done";
    case "error":
      return "Failed";
    default:
      return status;
  }
}

function fileProgressPercent(file: SelectedFile): number {
  if (file.file.size === 0) return file.status === "success" ? 100 : 0;
  return Math.min(100, Math.floor((file.loadedBytes / file.file.size) * 100));
}

export function FileList({ files, isUploading, onRemove }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        No files selected. Choose one or more files to upload.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Selected files">
      {files.map((file) => {
        const isOversized = file.file.size > appConfig.maxUploadBytes;
        const percent = fileProgressPercent(file);
        const showSpinner = file.status === "presigning";

        return (
          <li
            key={file.id}
            className="rounded-lg border border-separator bg-surface p-3 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" title={file.file.name}>
                  {getFileBasename(file.file.name)}
                </p>
                <p className="text-xs text-muted">{formatFileSize(file.file.size)}</p>
                {isOversized && (
                  <p className="text-xs text-danger mt-1">
                    Exceeds maximum size ({formatFileSize(appConfig.maxUploadBytes)})
                  </p>
                )}
                {file.error && (
                  <p className="text-xs text-danger mt-1" role="alert">
                    {file.error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted flex items-center gap-1">
                  {showSpinner && <Spinner size="sm" />}
                  {statusLabel(file.status)}
                </span>
                <Button
                  variant="tertiary"
                  size="sm"
                  isDisabled={isUploading}
                  onPress={() => onRemove(file.id)}
                  aria-label={`Remove ${getFileBasename(file.file.name)}`}
                >
                  Remove
                </Button>
              </div>
            </div>
            {file.status === "uploading" && (
              <ProgressBar aria-label={`Upload progress for ${file.file.name}`} value={percent}>
                <ProgressBar.Output />
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            )}
          </li>
        );
      })}
    </ul>
  );
}
