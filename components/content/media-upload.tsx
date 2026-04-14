'use client'

import { useState, useRef } from 'react'
import { uploadContentMedia, deleteContentMedia } from '@/app/(workspace)/content/actions'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2, Film, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MediaUpload({
  urls,
  onChange,
}: {
  urls: string[]
  onChange: (urls: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUrls = [...urls]

    for (const file of Array.from(files)) {
      // Validate size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} es demasiado grande (max 50MB)`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        const url = await uploadContentMedia(formData)
        newUrls.push(url)
      } catch {
        toast.error(`Error subiendo ${file.name}`)
      }
    }

    onChange(newUrls)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove(url: string) {
    try {
      await deleteContentMedia(url)
      onChange(urls.filter((u) => u !== url))
    } catch {
      toast.error('Error eliminando archivo')
    }
  }

  function isVideo(url: string) {
    return /\.(mp4|mov|avi|webm|mkv)$/i.test(url)
  }

  return (
    <div className="space-y-3">
      {/* Media grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url) => (
            <div key={url} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
              {isVideo(url) ? (
                <div className="flex h-full items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                  <video src={url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                </div>
              ) : (
                <img src={url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(url)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {uploading ? 'Subiendo...' : 'Subir imagen o video'}
      </Button>
    </div>
  )
}
