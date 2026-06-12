import { useCallback, useEffect, useState } from "react";

import { fetchS3FileList } from "@/services/listFilesApi";
import type { S3FileObject } from "@/types/s3File";

export function useS3FileList() {
  const [files, setFiles] = useState<S3FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchS3FileList();
      setFiles(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load files.";
      setError(message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { files, isLoading, error, refresh };
}
