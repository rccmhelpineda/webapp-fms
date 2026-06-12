import { Button, Card, Spinner } from "@heroui/react";

import type { S3FileObject } from "@/types/s3File";
import { formatFileSize } from "@/utils/bytes";
import { formatDateTime } from "@/utils/dates";

interface S3FileTableProps {
  files: S3FileObject[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function S3FileTable({ files, isLoading, error, onRefresh }: S3FileTableProps) {
  return (
    <Card className="w-full">
      <Card.Header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Card.Title>Files in storage</Card.Title>
          <Card.Description>
            Objects in the upload bucket, newest first.
          </Card.Description>
        </div>
        <Button
          variant="secondary"
          size="sm"
          isDisabled={isLoading}
          onPress={onRefresh}
          className="shrink-0 self-start sm:self-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Refreshing…
            </span>
          ) : (
            "Refresh"
          )}
        </Button>
      </Card.Header>

      <Card.Content>
        {error && (
          <p className="text-sm text-danger mb-4" role="alert">
            {error}
          </p>
        )}

        {!error && !isLoading && files.length === 0 && (
          <p className="text-sm text-muted text-center py-6">No files in the bucket yet.</p>
        )}

        {(files.length > 0 || (isLoading && files.length === 0 && !error)) && (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[480px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-separator text-left text-muted">
                  <th className="py-2 pr-3 font-medium">File name</th>
                  <th className="py-2 pr-3 font-medium whitespace-nowrap">Size</th>
                  <th className="py-2 font-medium whitespace-nowrap">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && files.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted">
                      <span className="inline-flex items-center gap-2">
                        <Spinner size="sm" />
                        Loading files…
                      </span>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr
                      key={`${file.filename}-${file.lastModified}`}
                      className="border-b border-separator/60 last:border-0"
                    >
                      <td className="py-3 pr-3 font-medium break-all">{file.filename}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 whitespace-nowrap text-muted">
                        {file.lastModified ? formatDateTime(file.lastModified) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
