export type FileUploadStatus =
  | "pending"
  | "presigning"
  | "uploading"
  | "success"
  | "error";

export type UploadPhase = "idle" | "uploading" | "done";

export interface SelectedFile {
  id: string;
  file: File;
  status: FileUploadStatus;
  loadedBytes: number;
  error?: string;
}

export interface UploadState {
  files: SelectedFile[];
  phase: UploadPhase;
  validationMessage: string | null;
  submitAttempted: boolean;
}

export type UploadAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "CLEAR_ALL" }
  | { type: "START_UPLOAD" }
  | { type: "UPLOAD_COMPLETE" }
  | { type: "SET_VALIDATION"; message: string | null }
  | { type: "PRESIGN_START"; id: string }
  | { type: "UPLOAD_START"; id: string }
  | { type: "PUT_PROGRESS"; id: string; loadedBytes: number }
  | { type: "UPLOAD_SUCCESS"; id: string }
  | { type: "UPLOAD_ERROR"; id: string; error: string }
  | { type: "RETRY_FAILED" };

export interface PresignResponse {
  upload_url: string;
  filename: string;
}

export interface UploadSummary {
  total: number;
  successCount: number;
  failedCount: number;
  failedNames: string[];
  kind: "success" | "partial" | "failure" | null;
}
