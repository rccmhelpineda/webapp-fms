import { getFileContentType } from "@/utils/filename";
import { mapNetworkError, mapS3PutError } from "@/utils/errors";

export function putFileToS3(
  uploadUrl: string,
  file: File,
  onProgress: (loadedBytes: number) => void,
): Promise<void> {
  const contentType = getFileContentType(file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(file.size);
        resolve();
        return;
      }
      reject(new Error(mapS3PutError(xhr.status)));
    };

    xhr.onerror = () => {
      reject(new Error(mapNetworkError()));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(file);
  });
}
