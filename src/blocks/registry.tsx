import React from "react";

// Hero Block Component
interface HeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

function Hero({ title, subtitle, image }: HeroProps) {
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
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg md:text-xl opacity-90">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// PostsFeed Block Component
interface PostsFeedProps {
  posts?: Array<{
    id: string;
    title: string;
    excerpt?: string;
    slug?: string;
  }>;
}

function PostsFeed({ posts = [] }: PostsFeedProps) {
  if (posts.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-500">No posts available</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// Blocks Registry
export const Blocks = {
  Hero,
  PostsFeed,
} as const;

// Block Instance Type
export type BlockInstance = {
  type: keyof typeof Blocks;
  props: Record<string, any>;
};

// Block Renderer Component
interface BlockRendererProps {
  block: BlockInstance;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const BlockComponent = Blocks[block.type];
  
  if (!BlockComponent) {
    console.warn(`Unknown block type: ${block.type}`);
    return null;
  }

  return <BlockComponent {...block.props} />;
}

