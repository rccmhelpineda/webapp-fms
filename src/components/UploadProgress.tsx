import { ProgressBar } from "@heroui/react";

interface UploadProgressProps {
  visible: boolean;
  percent: number;
  activeCount: number;
  totalCount: number;
}

export function UploadProgress({
  visible,
  percent,
  activeCount,
  totalCount,
}: UploadProgressProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-foreground">
        Uploading {activeCount} of {totalCount} — {percent}%
      </p>
      <ProgressBar aria-label="Overall upload progress" value={percent}>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
