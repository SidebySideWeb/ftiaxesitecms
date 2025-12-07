"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/datatable"
import { usePosts, type Post } from "@/lib/hooks/use-posts"
import { Badge } from "@/components/ui/badge"

export default function PostsListPage() {
  const router = useRouter()
  const { posts, deletePost, isLoading } = usePosts()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost(id)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row: Post) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row: Post) => (
        <Badge variant={row.status === "published" ? "default" : "secondary"} className="rounded-full">
          {row.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "publishedAt",
      label: "Published",
      render: (row: Post) => (
        <span className="text-muted-foreground">
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: Post) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleDelete(e, row.id)}
          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
      </div>

      <DataTable
        data={posts}
        columns={columns}
        searchKey="title"
        onRowClick={(row) => router.push(`/posts/${row.id}`)}
      />

      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={() => router.push("/posts/new")} size="lg" className="h-14 gap-2 rounded-2xl px-6 shadow-lg">
          <Plus className="h-5 w-5" />
          New Post
        </Button>
      </motion.div>
    </div>
  )
}

