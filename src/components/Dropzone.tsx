import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { validateFile } from '@/lib/fileValidation'
import { cn } from '@/lib/utils'

export function Dropzone({
  onFiles,
  disabled,
  compact,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
  compact?: boolean
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    disabled,
    onDrop: (accepted, rejections) => {
      const valid = accepted.filter((f) => validateFile(f).ok)
      const skipped = accepted.length - valid.length + rejections.length
      if (skipped > 0) {
        toast.error('Some files were skipped — use PNG, JPG, or WebP under 25 MB.')
      }
      if (valid.length) onFiles(valid)
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors',
        compact ? 'gap-1.5 p-4' : 'gap-3 p-8 sm:p-12',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/40',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={cn(
          'text-muted-foreground transition-colors group-hover:text-primary',
          compact ? 'h-5 w-5' : 'h-9 w-9'
        )}
      />
      <div>
        <p className={cn('font-medium', compact && 'text-sm')}>
          {isDragActive
            ? 'Drop to add'
            : compact
              ? 'Add more images'
              : 'Drop images here'}
        </p>
        {!compact && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            or click to browse · PNG, JPG, WebP · up to 25 MB
          </p>
        )}
      </div>
    </div>
  )
}
