import { useCallback, useRef, useState } from 'react';
import { parseCsv } from '@/lib/csv';
import { Button } from '@/components/ui/button';

export type CsvData = {
  fileName: string;
  columns: string[];
  rows: string[][];
};

type CsvDropzoneProps = {
  onLoaded: (data: CsvData) => void;
  disabled?: boolean;
};

export function CsvDropzone({ onLoaded, disabled }: CsvDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }
      const file = files[0];

      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a .csv file.');
        return;
      }

      try {
        const text = await file.text();
        const parsed = parseCsv(text);

        if (!parsed.header.length) {
          setError('No header row found in CSV.');
          return;
        }

        onLoaded({
          fileName: file.name,
          columns: parsed.header,
          rows: parsed.rows,
        });
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to read CSV file.';
        setError(message);
      }
    },
    [onLoaded],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }
      setIsDragActive(false);
      const files = event.dataTransfer.files;
      void handleFiles(files);
    },
    [disabled, handleFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    event.dataTransfer.dropEffect = 'copy';
    setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    setIsDragActive(false);
  }, [disabled]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    void handleFiles(event.target.files);
  }, [disabled, handleFiles]);

  const handleBrowseClick = useCallback(() => {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  }, [disabled]);

  return (
    <div className="space-y-3">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'flex flex-col items-center justify-center gap-2',
          'rounded-lg border border-dashed px-6 py-10 text-center transition',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-blue-500 hover:text-blue-500',
          isDragActive ? 'border-blue-500 bg-blue-50/40 text-blue-600' : 'border-border text-muted-foreground',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="text-base font-medium">Drop CSV here</span>
        <span className="text-sm text-muted-foreground">
          We will detect the columns automatically
        </span>
      </label>
      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBrowseClick}
          disabled={disabled}
        >
          Upload CSV
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
