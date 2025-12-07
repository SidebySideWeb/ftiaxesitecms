"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from 'lucide-react'
import type { Block } from "@/lib/hooks/use-pages"
import { SortableBlock } from "./sortable-block"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

interface BlockListProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onReorder: (blocks: Block[]) => void
  onAddBlock: (type: Block["type"], afterId?: string) => void
  onDeleteBlock: (id: string) => void
  onBlockUpdate: (id: string, data: Record<string, unknown>) => void
}

const blockTypes: { type: Block["type"]; label: string; description: string }[] = [
  { type: "hero", label: "Hero", description: "Large header with image" },
  { type: "text-image", label: "Text + Image", description: "Content with side image" },
  { type: "gallery", label: "Gallery", description: "Image grid display" },
  { type: "posts-feed", label: "Posts Feed", description: "Recent blog posts" },
  { type: "cta", label: "Call to Action", description: "Conversion section" },
]

export function BlockList({
  blocks,
  selectedBlockId,
  onSelect,
  onReorder,
  onAddBlock,
  onDeleteBlock,
  onBlockUpdate,
}: BlockListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addAfterBlockId, setAddAfterBlockId] = useState<string | undefined>()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      onReorder(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const handleAddClick = (afterId?: string) => {
    setAddAfterBlockId(afterId)
    setShowAddModal(true)
  }

  const handleSelectBlockType = (type: Block["type"]) => {
    onAddBlock(type, addAfterBlockId)
    setShowAddModal(false)
    setAddAfterBlockId(undefined)
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="relative">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative">
                <SortableBlock
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelect(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onUpdate={(data) => onBlockUpdate(block.id, data)}
                />
                {/* Add button between blocks */}
                <div className="group relative flex h-8 items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-border opacity-0 transition-opacity group-hover:opacity-100" />
                  <motion.button
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleAddClick(block.id)}
                    className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-all hover:border-primary hover:text-primary group-hover:opacity-100"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Select Block Type">
        <div className="grid gap-2">
          {blockTypes.map((bt) => (
            <Button
              key={bt.type}
              variant="outline"
              onClick={() => handleSelectBlockType(bt.type)}
              className="flex h-auto flex-col items-start gap-1 rounded-xl p-4 text-left"
            >
              <span className="font-medium">{bt.label}</span>
              <span className="text-sm text-muted-foreground">{bt.description}</span>
            </Button>
          ))}
        </div>
      </Modal>
    </>
  )
}
