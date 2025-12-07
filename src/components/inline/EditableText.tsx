"use client";

import React, { useRef, useEffect } from "react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "Click to edit...",
}: EditableTextProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== value) {
      divRef.current.innerText = value;
    }
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.target.innerText.trim();
    onChange(newValue);
  };

  return (
    <div
      ref={divRef}
      contentEditable
      onBlur={handleBlur}
      className={`editable-text min-h-[1.5em] border-b border-dashed border-gray-300 focus:outline-none focus:border-gray-500 dark:border-gray-600 dark:focus:border-gray-400 ${className}`}
      suppressContentEditableWarning
      data-placeholder={placeholder}
    />
  );
}

