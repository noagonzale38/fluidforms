"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { ImagePlus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload: (url: string) => void
  defaultImage?: string
  maxSize?: number // in MB
  aspectRatio?: number
  className?: string
}

export function ImageUpload({
  onUpload,
  defaultImage,
  maxSize = 5, // Default 5MB
  aspectRatio,
  className,
  ...props
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | undefined>(defaultImage)
  const { toast } = useToast()

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (!file) return

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSize}MB`,
          variant: "destructive",
        })
        return
      }

      try {
        setIsUploading(true)

        // Create form data
        const formData = new FormData()
        formData.append("file", file)

        // Upload to Supabase via Edge Function
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("discord_token")}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to upload image")
        }

        const data = await response.json()

        if (data.url) {
          setPreview(data.url)
          onUpload(data.url)
          toast({
            title: "Image uploaded",
            description: "Your image has been uploaded successfully",
          })
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [maxSize, onUpload, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 p-6 text-center hover:bg-accent/50",
        isDragActive && "border-primary bg-accent",
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : preview ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
            style={aspectRatio ? { aspectRatio } : undefined}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImagePlus className="h-10 w-10 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}