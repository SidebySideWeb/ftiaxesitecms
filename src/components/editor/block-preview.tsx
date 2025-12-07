"use client"

import type { Block } from "@/lib/hooks/use-pages"
import { InlineText } from "./inline-text"
import { ImageUploader } from "./image-uploader"

interface BlockPreviewProps {
  block: Block
  onUpdate: (data: Record<string, unknown>) => void
}

export function BlockPreview({ block, onUpdate }: BlockPreviewProps) {
  switch (block.type) {
    case "hero":
      return <HeroPreview data={block.data} onUpdate={onUpdate} />
    case "text-image":
      return <TextImagePreview data={block.data} onUpdate={onUpdate} />
    case "gallery":
      return <GalleryPreview data={block.data} onUpdate={onUpdate} />
    case "posts-feed":
      return <PostsFeedPreview data={block.data} />
    case "cta":
      return <CTAPreview data={block.data} onUpdate={onUpdate} />
    default:
      return <div className="p-8 text-center text-muted-foreground">Unknown block type</div>
  }
}

function HeroPreview({ data, onUpdate }: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center">
      {data.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${data.image})` }}
        />
      )}
      <div className="relative z-10">
        <InlineText
          value={String(data.title || "")}
          onChange={(v) => onUpdate({ title: v })}
          className="mb-4 text-4xl font-bold"
          placeholder="Hero Title"
        />
        <InlineText
          value={String(data.subtitle || "")}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg text-muted-foreground"
          placeholder="Hero subtitle"
        />
      </div>
    </div>
  )
}

function TextImagePreview({
  data,
  onUpdate,
}: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  const imageRight = data.imagePosition === "right"

  return (
    <div className={`flex gap-8 p-8 ${imageRight ? "flex-row" : "flex-row-reverse"}`}>
      <div className="flex-1 space-y-4">
        <InlineText
          value={String(data.heading || "")}
          onChange={(v) => onUpdate({ heading: v })}
          className="text-2xl font-semibold"
          placeholder="Heading"
        />
        <InlineText
          value={String(data.text || "")}
          onChange={(v) => onUpdate({ text: v })}
          className="text-muted-foreground"
          placeholder="Add your content here..."
          multiline
        />
      </div>
      <div className="w-64 shrink-0">
        <ImageUploader
          value={String(data.image || "")}
          onChange={(v) => onUpdate({ image: v })}
          className="aspect-[4/3] rounded-xl"
        />
      </div>
    </div>
  )
}

function GalleryPreview({
  data,
  onUpdate,
}: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  const images = (data.images as string[]) || []

  return (
    <div className="p-8">
      <p className="mb-4 text-sm font-medium text-muted-foreground">Gallery ({images.length} images)</p>
      <div className="grid grid-cols-3 gap-4">
        {images.slice(0, 6).map((img, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
            <img src={img || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        <ImageUploader
          value=""
          onChange={(v) => onUpdate({ images: [...images, v] })}
          className="aspect-square rounded-xl"
          placeholder="Add image"
        />
      </div>
    </div>
  )
}

function PostsFeedPreview({ data }: { data: Record<string, unknown> }) {
  const limit = Number(data.limit) || 3

  return (
    <div className="p-8">
      <p className="mb-4 text-lg font-semibold">Latest Posts</p>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="mb-3 aspect-video rounded-lg bg-muted" />
            <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CTAPreview({ data, onUpdate }: { data: Record<string, unknown>; onUpdate: (data: Record<string, unknown>) => void }) {
  return (
    <div className="rounded-xl bg-primary/10 p-12 text-center">
      <InlineText
        value={String(data.title || "")}
        onChange={(v) => onUpdate({ title: v })}
        className="mb-6 text-2xl font-bold"
        placeholder="Call to Action Title"
      />
      <button className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
        <InlineText
          value={String(data.buttonLabel || "")}
          onChange={(v) => onUpdate({ buttonLabel: v })}
          className="text-inherit"
          placeholder="Button Text"
        />
      </button>
    </div>
  )
}
