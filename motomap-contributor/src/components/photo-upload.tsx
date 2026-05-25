'use client'

import { useCallback, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PhotoFile {
  id: string
  file: File
  preview: string
}

interface PhotoUploadProps {
  photos: PhotoFile[]
  onChange: (photos: PhotoFile[]) => void
  maxFiles?: number
  className?: string
}

export function PhotoUpload({ photos, onChange, maxFiles = 5, className }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const remaining = maxFiles - photos.length
      const toAdd = Array.from(files).slice(0, remaining)

      const newPhotos: PhotoFile[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

      onChange([...photos, ...newPhotos])
    },
    [photos, onChange, maxFiles]
  )

  const removePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id)
    if (photo) URL.revokeObjectURL(photo.preview)
    onChange(photos.filter((p) => p.id !== id))
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const canAdd = photos.length < maxFiles

  return (
    <div className={cn('space-y-3', className)}>
      {canAdd && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50"
        >
          <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {photos.length}/{maxFiles} photos · PNG, JPG, WebP
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt="upload preview"
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  removePhoto(photo.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
