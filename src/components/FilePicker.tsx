import { useRef } from "react";
import { Button } from "@heroui/react";

interface FilePickerProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

export function FilePicker({ onFilesSelected, disabled }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            onFilesSelected(files);
          }
          event.target.value = "";
        }}
      />
      <Button
        variant="secondary"
        isDisabled={disabled}
        onPress={() => inputRef.current?.click()}
      >
        Choose files
      </Button>
    </>
  );
}
