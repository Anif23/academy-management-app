import { useRef, useState } from 'react';
import { FileVideo, ImageIcon, Loader2, Paperclip, Upload, X } from 'lucide-react';
import { uploadFiles, type UploadFolder } from '../../services/uploadApi';
import type { UploadedFileRef } from '../../types';
import { toastError } from '../../store/toastStore';
import { cn } from '../../utils/cn';

interface FileUploadFieldProps {
  folder: UploadFolder;
  value: UploadedFileRef[];
  onChange: (files: UploadedFileRef[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
  label?: string;
  hint?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(fileType: string) {
  return fileType.startsWith('image/');
}
function isVideo(fileType: string) {
  return fileType.startsWith('video/');
}

/**
 * Multi-file upload with preview and remove-before-submit, used for task
 * attachments (trainer) and submission files (student). Files upload to S3
 * immediately on selection (via uploadApi) so the parent form just holds
 * the resulting { url, fileName, fileType, fileSize } refs.
 */
export function FileUploadField({
  folder,
  value,
  onChange,
  disabled,
  accept = 'image/*,video/*',
  maxFiles = 5,
  label = 'Attach files',
  hint = 'Images or videos, up to 5 files.',
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<number, number>>({});

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);

    if (value.length + incoming.length > maxFiles) {
      toastError(`You can attach up to ${maxFiles} files.`);
      return;
    }

    setUploading(true);
    setProgress({});
    try {
      const uploaded = await uploadFiles(incoming, folder, (index, percent) =>
        setProgress((prev) => ({ ...prev, [index]: percent })),
      );
      onChange([...value, ...uploaded]);
    } catch (error) {
      toastError('Upload failed', error instanceof Error ? error.message : undefined);
    } finally {
      setUploading(false);
      setProgress({});
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeFile(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface-muted px-4 py-6 text-center transition-colors',
          !disabled && 'cursor-pointer hover:border-brand-400 hover:bg-brand-50/40',
        )}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            <p className="text-sm text-text-secondary">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-text-muted" />
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <p className="text-xs text-text-muted">{hint}</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.url}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
            >
              {isImage(file.fileType) ? (
                <img src={file.url} alt={file.fileName} className="h-10 w-10 shrink-0 rounded-md object-cover" />
              ) : isVideo(file.fileType) ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                  <FileVideo className="h-5 w-5 text-text-muted" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                  <Paperclip className="h-5 w-5 text-text-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{file.fileName}</p>
                <p className="text-xs text-text-muted">{formatBytes(file.fileSize)}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.fileName}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FilePreviewList({ files }: { files: UploadedFileRef[] }) {
  if (files.length === 0) return <p className="text-sm text-text-muted">No files attached.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((file, index) => (
        <a
          key={`${file.url}-${index}`}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="group relative overflow-hidden rounded-lg border border-border bg-surface-muted"
        >
          {isImage(file.fileType) ? (
            <img src={file.url} alt={file.fileName} className="h-24 w-full object-cover" />
          ) : (
            <div className="flex h-24 w-full flex-col items-center justify-center gap-1 text-text-muted">
              {isVideo(file.fileType) ? <FileVideo className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
              <span className="px-2 text-center text-[11px] leading-tight">{file.fileName}</span>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
