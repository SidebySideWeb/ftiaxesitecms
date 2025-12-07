"use client"

import type { Block } from "@/lib/hooks/use-pages"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploader } from "./image-uploader"

interface BlockEditorProps {
  block: Block
  onUpdate: (data: Record<string, unknown>) => void
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const blockTypeLabels: Record<string, string> = {
    hero: "Hero Section",
    "text-image": "Text + Image",
    gallery: "Image Gallery",
    "posts-feed": "Posts Feed",
    cta: "Call to Action",
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{blockTypeLabels[block.type]}</h3>
        <p className="text-sm text-muted-foreground">Edit block properties</p>
      </div>

      <div className="space-y-4">
        {block.type === "hero" && <HeroFields data={block.data} onUpdate={onUpdate} />}
        {block.type === "text-image" && <TextImageFields data={block.data} onUpdate={onUpdate} />}
        {block.type === "gallery" && <GalleryFields data={block.data} onUpdate={onUpdate} />}
        {block.type === "posts-feed" && <PostsFeedFields data={block.data} onUpdate={onUpdate} />}
        {block.type === "cta" && <CTAFields data={block.data} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

function HeroFields({ data, onUpdate }: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={String(data.title || "")}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Hero title"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea
          value={String(data.subtitle || "")}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="Hero subtitle"
          className="rounded-xl"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Background Image</Label>
        <ImageUploader
          value={String(data.image || "")}
          onChange={(v) => onUpdate({ image: v })}
          className="aspect-video rounded-xl"
        />
      </div>
    </>
  )
}

function TextImageFields({
  data,
  onUpdate,
}: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Heading</Label>
        <Input
          value={String(data.heading || "")}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Section heading"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Text</Label>
        <Textarea
          value={String(data.text || "")}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Section content"
          className="rounded-xl"
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Image Position</Label>
        <Select value={String(data.imagePosition || "right")} onValueChange={(v) => onUpdate({ imagePosition: v })}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUploader
          value={String(data.image || "")}
          onChange={(v) => onUpdate({ image: v })}
          className="aspect-[4/3] rounded-xl"
        />
      </div>
    </>
  )
}

function GalleryFields({
  data,
  onUpdate,
}: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  const images = (data.images as string[]) || []

  return (
    <div className="space-y-2">
      <Label>Images ({images.length})</Label>
      <p className="text-sm text-muted-foreground">Add images directly in the preview area</p>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={img || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => onUpdate({ images: images.filter((_, j) => j !== i) })}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PostsFeedFields({
  data,
  onUpdate,
}: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Number of Posts</Label>
        <Input
          type="number"
          value={String(data.limit || 3)}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          min={1}
          max={12}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Category (optional)</Label>
        <Input
          value={String(data.category || "")}
          onChange={(e) => onUpdate({ category: e.target.value })}
          placeholder="Filter by category"
          className="rounded-xl"
        />
      </div>
    </>
  )
}

function CTAFields({ data, onUpdate }: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={String(data.title || "")}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="CTA title"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Button Label</Label>
        <Input
          value={String(data.buttonLabel || "")}
          onChange={(e) => onUpdate({ buttonLabel: e.target.value })}
          placeholder="Button text"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Button Link</Label>
        <Input
          value={String(data.buttonLink || "")}
          onChange={(e) => onUpdate({ buttonLink: e.target.value })}
          placeholder="/contact"
          className="rounded-xl"
        />
      </div>
    </>
  )
}
