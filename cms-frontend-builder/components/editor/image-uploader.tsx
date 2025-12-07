"use client"

import { useRef, useState } from "react"
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { uploadImageForTenant } from "@/actions/upload"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function ImageUploader({ value, onChange, className, placeholder = "Upload image" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show immediate preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Upload to Supabase
    setIsUploading(true)
    try {
      const result = await uploadImageForTenant(file)
      
      if ('error' in result && result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      // Replace preview with Supabase URL
      if ('data' in result && result.data) {
        URL.revokeObjectURL(objectUrl) // Clean up object URL
        setPreview(result.data.url)
        onChange(result.data.url)
        toast({
          title: "Upload successful",
          description: "Image uploaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ""
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {preview || value ? (
        <>
          <img src={preview || value} alt="" className="h-full w-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
          <span className="text-sm">{isUploading ? "Uploading..." : placeholder}</span>
        </div>
      )}
    </div>
  )
}
