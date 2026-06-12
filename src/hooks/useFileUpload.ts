import { useCallback, useMemo, useReducer, useRef } from "react";

import { appConfig } from "@/config";
import { requestPresignUrl } from "@/services/presignApi";
import { putFileToS3 } from "@/services/s3Upload";
import type {
  SelectedFile,
  UploadAction,
  UploadState,
  UploadSummary,
} from "@/types/upload";
import { getFileBasename } from "@/utils/filename";

const initialState: UploadState = {
  files: [],
  phase: "idle",
  validationMessage: null,
  submitAttempted: false,
};

function createSelectedFile(file: File): SelectedFile {
  return {
    id: crypto.randomUUID(),
    file,
    status: "pending",
    loadedBytes: 0,
  };
}

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "ADD_FILES": {
      const newFiles = action.files.map(createSelectedFile);
      return {
        files: [...state.files, ...newFiles],
        phase: "idle",
        validationMessage: null,
        submitAttempted: false,
      };
    }
    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.id),
        validationMessage: null,
      };
    case "CLEAR_ALL":
      return { ...initialState };
    case "SET_VALIDATION":
      return { ...state, validationMessage: action.message, submitAttempted: true };
    case "START_UPLOAD":
      return {
        ...state,
        phase: "uploading",
        validationMessage: null,
        files: state.files.map((file) =>
          file.status === "error"
            ? { ...file, status: "pending", loadedBytes: 0, error: undefined }
            : file,
        ),
      };
    case "UPLOAD_COMPLETE":
      return { ...state, phase: "done" };
    case "PRESIGN_START":
      return updateFile(state, action.id, { status: "presigning", error: undefined });
    case "UPLOAD_START":
      return updateFile(state, action.id, { status: "uploading" });
    case "PUT_PROGRESS":
      return updateFile(state, action.id, { loadedBytes: action.loadedBytes });
    case "UPLOAD_SUCCESS":
      return updateFile(state, action.id, {
        status: "success",
        loadedBytes: getFileSize(state, action.id),
        error: undefined,
      });
    case "UPLOAD_ERROR":
      return updateFile(state, action.id, {
        status: "error",
        error: action.error,
      });
    case "RETRY_FAILED":
      return {
        ...state,
        phase: "idle",
        validationMessage: null,
        files: state.files.map((file) =>
          file.status === "error"
            ? { ...file, status: "pending", loadedBytes: 0, error: undefined }
            : file,
        ),
      };
    default:
      return state;
  }
}

function updateFile(
  state: UploadState,
  id: string,
  patch: Partial<SelectedFile>,
): UploadState {
  return {
    ...state,
    files: state.files.map((file) => (file.id === id ? { ...file, ...patch } : file)),
  };
}

function getFileSize(state: UploadState, id: string): number {
  return state.files.find((file) => file.id === id)?.file.size ?? 0;
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;

  const queue = [...items];
  const poolSize = Math.min(limit, items.length);

  await Promise.all(
    Array.from({ length: poolSize }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) {
          await worker(item);
        }
      }
    }),
  );
}

function computeSummary(files: SelectedFile[]): UploadSummary {
  const total = files.length;
  const successCount = files.filter((file) => file.status === "success").length;
  const failedFiles = files.filter((file) => file.status === "error");
  const failedCount = failedFiles.length;
  const failedNames = failedFiles.map((file) => getFileBasename(file.file.name));

  let kind: UploadSummary["kind"] = null;
  if (total > 0 && successCount === total) kind = "success";
  else if (successCount > 0 && failedCount > 0) kind = "partial";
  else if (failedCount === total) kind = "failure";

  return { total, successCount, failedCount, failedNames, kind };
}

export function useFileUpload() {
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const isUploading = state.phase === "uploading";

  const hasOversizedFile = useMemo(
    () => state.files.some((file) => file.file.size > appConfig.maxUploadBytes),
    [state.files],
  );

  const aggregateProgress = useMemo(() => {
    const totalBytes = state.files.reduce((sum, file) => sum + file.file.size, 0);
    if (totalBytes === 0) return 0;
    const loadedBytes = state.files.reduce((sum, file) => sum + file.loadedBytes, 0);
    return Math.floor((loadedBytes / totalBytes) * 100);
  }, [state.files]);

  const activeFileCount = useMemo(() => {
    return state.files.filter((file) => file.status !== "pending").length;
  }, [state.files]);

  const summary = useMemo(() => computeSummary(state.files), [state.files]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length > 0) {
      dispatch({ type: "ADD_FILES", files: list });
    }
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      if (stateRef.current.phase === "uploading") return;
      dispatch({ type: "REMOVE_FILE", id });
    },
    [],
  );

  const clearAll = useCallback(() => {
    if (stateRef.current.phase === "uploading") return;
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const uploadFile = useCallback(async (selected: SelectedFile) => {
    dispatch({ type: "PRESIGN_START", id: selected.id });

    try {
      const { upload_url } = await requestPresignUrl(selected.file);
      dispatch({ type: "UPLOAD_START", id: selected.id });

      await putFileToS3(upload_url, selected.file, (loadedBytes) => {
        dispatch({ type: "PUT_PROGRESS", id: selected.id, loadedBytes });
      });

      dispatch({ type: "UPLOAD_SUCCESS", id: selected.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      dispatch({ type: "UPLOAD_ERROR", id: selected.id, error: message });
    }
  }, []);

  const startUpload = useCallback(async () => {
    const current = stateRef.current;

    if (current.phase === "uploading") return;

    if (current.files.length === 0) {
      dispatch({
        type: "SET_VALIDATION",
        message: "Select at least one file before uploading.",
      });
      return;
    }

    if (current.files.some((file) => file.file.size > appConfig.maxUploadBytes)) {
      dispatch({
        type: "SET_VALIDATION",
        message: "One or more files exceed the maximum allowed size.",
      });
      return;
    }

    dispatch({ type: "START_UPLOAD" });

    const filesToUpload = stateRef.current.files.filter(
      (file) => file.status === "pending" || file.status === "error",
    );

    await runWithConcurrency(
      filesToUpload,
      appConfig.uploadConcurrency,
      uploadFile,
    );

    dispatch({ type: "UPLOAD_COMPLETE" });
  }, [uploadFile]);

  const retryFailed = useCallback(async () => {
    const current = stateRef.current;
    const failed = current.files.filter((file) => file.status === "error");
    if (failed.length === 0 || current.phase === "uploading") return;

    dispatch({ type: "RETRY_FAILED" });
    dispatch({ type: "START_UPLOAD" });

    const toRetry = stateRef.current.files.filter((file) => file.status === "pending");

    await runWithConcurrency(toRetry, appConfig.uploadConcurrency, uploadFile);
    dispatch({ type: "UPLOAD_COMPLETE" });
  }, [uploadFile]);

  return {
    files: state.files,
    phase: state.phase,
    validationMessage: state.validationMessage,
    submitAttempted: state.submitAttempted,
    isUploading,
    hasOversizedFile,
    aggregateProgress,
    activeFileCount,
    summary,
    maxUploadBytes: appConfig.maxUploadBytes,
    addFiles,
    removeFile,
    clearAll,
    startUpload,
    retryFailed,
  };
}
