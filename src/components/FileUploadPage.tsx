import { useEffect, useRef } from "react";
import { Button, Card, Spinner } from "@heroui/react";

import { useFileUpload } from "@/hooks/useFileUpload";
import { useS3FileList } from "@/hooks/useS3FileList";
import { BrandHeader } from "@/components/BrandHeader";
import { FileList } from "@/components/FileList";
import { FilePicker } from "@/components/FilePicker";
import { S3FileTable } from "@/components/S3FileTable";
import { UploadProgress } from "@/components/UploadProgress";
import { UploadStatusAlert } from "@/components/UploadStatusAlert";
import { formatFileSize } from "@/utils/bytes";

export function FileUploadPage() {
  const {
    files,
    phase,
    validationMessage,
    isUploading,
    hasOversizedFile,
    aggregateProgress,
    activeFileCount,
    summary,
    maxUploadBytes,
    addFiles,
    removeFile,
    clearAll,
    startUpload,
    retryFailed,
  } = useFileUpload();

  const { files: s3Files, isLoading, error, refresh } = useS3FileList();
  const wasUploadingRef = useRef(false);

  useEffect(() => {
    if (wasUploadingRef.current && phase === "done" && summary.successCount > 0) {
      void refresh();
    }
    wasUploadingRef.current = phase === "uploading";
  }, [phase, summary.successCount, refresh]);

  const canSubmit =
    files.length > 0 && !isUploading && !hasOversizedFile;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <BrandHeader />

        <Card className="w-full">
          <Card.Header>
            <Card.Title>FMS File Upload</Card.Title>
            <Card.Description>
              Select one or more files to upload. Maximum file size:{" "}
              {formatFileSize(maxUploadBytes)}.
            </Card.Description>
          </Card.Header>

          <Card.Content className="flex flex-col gap-4">
            <UploadStatusAlert
              summary={summary}
              phase={phase}
              validationMessage={validationMessage}
              onRetryFailed={retryFailed}
              onClear={clearAll}
              isUploading={isUploading}
            />

            <UploadProgress
              visible={isUploading}
              percent={aggregateProgress}
              activeCount={activeFileCount}
              totalCount={files.length}
            />

            <FileList files={files} isUploading={isUploading} onRemove={removeFile} />
          </Card.Content>

          <Card.Footer className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <FilePicker onFilesSelected={addFiles} disabled={isUploading} />
              <Button
                variant="tertiary"
                isDisabled={isUploading || files.length === 0}
                onPress={clearAll}
              >
                Clear all
              </Button>
            </div>
            <Button
              variant="primary"
              isDisabled={!canSubmit}
              onPress={startUpload}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Uploading…
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </Card.Footer>
        </Card>

        <S3FileTable
          files={s3Files}
          isLoading={isLoading}
          error={error}
          onRefresh={refresh}
        />
      </div>
    </main>
  );
}
