"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { GripVertical, Trash2 } from "lucide-react"
import type { Block } from "@/lib/hooks/use-pages"
import { BlockPreview } from "./block-preview"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SortableBlockProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (data: Record<string, unknown>) => void
}

export function SortableBlock({ block, isSelected, onSelect, onDelete, onUpdate }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{
        scale: isDragging ? 1.02 : 1,
        opacity: isDragging ? 0.8 : 1,
      }}
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-xl border-2 transition-colors",
        isSelected ? "border-primary" : "border-transparent hover:border-muted",
        isDragging && "z-50 shadow-xl",
      )}
    >
      {/* Drag Handle & Actions */}
      <div className="absolute -left-10 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <BlockPreview block={block} onUpdate={onUpdate} />
    </motion.div>
  )
}
