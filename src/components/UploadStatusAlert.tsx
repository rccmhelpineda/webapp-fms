import { Alert, Button } from "@heroui/react";

import type { UploadSummary } from "@/types/upload";

interface UploadStatusAlertProps {
  summary: UploadSummary;
  phase: "idle" | "uploading" | "done";
  validationMessage: string | null;
  onRetryFailed: () => void;
  onClear: () => void;
  isUploading: boolean;
}

export function UploadStatusAlert({
  summary,
  phase,
  validationMessage,
  onRetryFailed,
  onClear,
  isUploading,
}: UploadStatusAlertProps) {
  if (validationMessage) {
    return (
      <Alert status="warning" role="alert">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Validation</Alert.Title>
          <Alert.Description>{validationMessage}</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (phase !== "done" || !summary.kind) return null;

  if (summary.kind === "success") {
    return (
      <Alert status="success" role="status">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Upload complete</Alert.Title>
          <Alert.Description>
            All {summary.total} file{summary.total === 1 ? "" : "s"} uploaded successfully.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (summary.kind === "failure") {
    return (
      <div className="flex flex-col gap-3">
        <Alert status="danger" role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Upload failed</Alert.Title>
            <Alert.Description>
              None of the selected files could be uploaded. Please review the errors
              below and try again.
            </Alert.Description>
          </Alert.Content>
        </Alert>
        <div className="flex gap-2">
          <Button variant="secondary" isDisabled={isUploading} onPress={onRetryFailed}>
            Retry failed
          </Button>
          <Button variant="tertiary" isDisabled={isUploading} onPress={onClear}>
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Alert status="warning" role="alert">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Partial upload failure</Alert.Title>
          <Alert.Description>
            {summary.successCount} of {summary.total} files uploaded. Failed:{" "}
            {summary.failedNames.join(", ")}.
          </Alert.Description>
        </Alert.Content>
      </Alert>
      <div className="flex gap-2">
        <Button variant="secondary" isDisabled={isUploading} onPress={onRetryFailed}>
          Retry failed
        </Button>
        <Button variant="tertiary" isDisabled={isUploading} onPress={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
