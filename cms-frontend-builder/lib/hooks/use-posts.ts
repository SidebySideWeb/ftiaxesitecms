"use client"

import { useState, useEffect } from "react"
import { useTenantId } from "@/lib/hooks/use-tenant-id"
import { listPosts, getPostById } from "@/lib/actions"

export interface Post {
  id: string
  title: string
  slug: string
  status: "draft" | "published" | "archived"
  publishedAt: string | null
  published_at?: string | null
  coverImage: string | null
  excerpt?: string
  content: string | any
}

export function usePosts() {
  const tenantId = useTenantId()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false)
      return
    }

    async function fetchPosts() {
      try {
        setIsLoading(true)
        const result = await listPosts()
        
        if (result.error) {
          // Silently handle error - tenant might not be set up yet
          setPosts([])
          setIsLoading(false)
          return
        }

        const formattedPosts: Post[] = (result.data || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          publishedAt: post.published_at,
          published_at: post.published_at,
          coverImage: null, // Can be added to schema if needed
          excerpt: post.excerpt,
          content: post.content,
        }))

        setPosts(formattedPosts)
        setIsLoading(false)
      } catch (error) {
        // Handle unexpected errors gracefully
        setPosts([])
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [tenantId])

  const addPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
  }

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return { posts, setPosts, addPost, updatePost, deletePost, isLoading }
}

export function usePost(postId: string) {
  const tenantId = useTenantId()
  const [post, setPost] = useState<Post | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tenantId || !postId || postId === "new") {
      setIsLoading(false)
      return
    }

    async function fetchPost() {
      try {
        setIsLoading(true)
        const result = await getPostById(postId)
        
        if (result.error || !result.data) {
          setIsLoading(false)
          return
        }

        const postData = result.data
        const formattedPost: Post = {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          status: postData.status,
          publishedAt: postData.published_at,
          published_at: postData.published_at,
          coverImage: null,
          excerpt: postData.excerpt,
          content: postData.content,
        }

        setPost(formattedPost)
        setIsLoading(false)
      } catch (error) {
        // Handle unexpected errors gracefully
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [tenantId, postId])

  return { post, isLoading }
}
