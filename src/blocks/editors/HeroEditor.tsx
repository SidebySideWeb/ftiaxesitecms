"use client";

import React, { useState, useTransition } from "react";
import { EditableText } from "@/components/inline/EditableText";
import { uploadImageForTenant } from "@/actions/upload";

interface HeroEditorProps {
  title: string;
  subtitle?: string;
  image?: string;
  onUpdate: (updates: { title?: string; subtitle?: string; image?: string }) => void;
}

export function HeroEditor({ title, subtitle, image, onUpdate }: HeroEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);
    startTransition(async () => {
      const result = await uploadImageForTenant(file);
      if (result.error) {
        alert(`Upload error: ${result.error}`);
      } else if (result.data) {
        onUpdate({ image: result.data.url });
      }
      setIsUploading(false);
    });
  };
  return (
    <section className="relative w-full">
      {image && (
        <div className="absolute inset-0 -z-10">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div className={`container mx-auto px-4 py-16 ${image ? "relative z-10" : ""}`}>
        <div className={`max-w-3xl ${image ? "text-white" : ""}`}>
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            <EditableText
              value={title}
              onChange={(newTitle) => onUpdate({ title: newTitle })}
              placeholder="Enter hero title..."
              className="inline-block"
            />
          </h1>
          <div className="mt-4 text-lg md:text-xl opacity-90">
            <EditableText
              value={subtitle || ""}
              onChange={(newSubtitle) => onUpdate({ subtitle: newSubtitle })}
              placeholder="Enter subtitle (optional)..."
              className="inline-block"
            />
          </div>
        </div>
        <div className="mt-6 max-w-3xl">
          <label className="block text-sm font-medium mb-2">
            Image
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading || isPending}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={image || ""}
              onChange={(e) => onUpdate({ image: e.target.value })}
              placeholder="Or enter image URL: https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {isUploading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploading...
              </p>
            )}
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Preview"
                  className="max-w-xs h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

