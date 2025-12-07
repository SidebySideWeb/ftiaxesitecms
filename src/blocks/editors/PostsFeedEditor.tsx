"use client";

import React from "react";
import { EditableText } from "@/components/inline/EditableText";

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
}

interface PostsFeedEditorProps {
  posts?: Post[];
  onUpdate: (updates: { posts?: Post[] }) => void;
}

export function PostsFeedEditor({ posts = [], onUpdate }: PostsFeedEditorProps) {
  const handlePostUpdate = (postId: string, field: "title" | "excerpt", value: string) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, [field]: value } : post
    );
    onUpdate({ posts: updatedPosts });
  };

  if (posts.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            No posts available. Posts will be loaded from the database.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              <EditableText
                value={post.title}
                onChange={(newTitle) => handlePostUpdate(post.id, "title", newTitle)}
                placeholder="Post title..."
                className="inline-block"
              />
            </h2>
            {post.excerpt !== undefined && (
              <div className="mt-2 text-gray-600 dark:text-gray-400">
                <EditableText
                  value={post.excerpt || ""}
                  onChange={(newExcerpt) => handlePostUpdate(post.id, "excerpt", newExcerpt)}
                  placeholder="Post excerpt (optional)..."
                  className="inline-block text-sm"
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

