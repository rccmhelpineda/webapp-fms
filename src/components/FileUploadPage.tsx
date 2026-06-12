import { Button, Card, Spinner } from "@heroui/react";

import { useFileUpload } from "@/hooks/useFileUpload";
import { FileList } from "@/components/FileList";
import { FilePicker } from "@/components/FilePicker";
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

  const canSubmit =
    files.length > 0 && !isUploading && !hasOversizedFile;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
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
          <div className="flex gap-2">
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
    </main>
  );
}
