"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface InlineTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
}

export function InlineText({ value, onChange, className, placeholder, multiline }: InlineTextProps) {
  const ref = useRef<HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (ref.current && !isEditing) {
      ref.current.textContent = value || ""
    }
  }, [value, isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    const newValue = ref.current?.textContent || ""
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  const Tag = multiline ? "p" : "span"

  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement & HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "outline-none transition-colors",
        "focus:ring-2 focus:ring-primary/20 focus:rounded-lg focus:px-1 focus:-mx-1",
        !value && "text-muted-foreground/50",
        className,
      )}
      data-placeholder={placeholder}
    />
  )
}
