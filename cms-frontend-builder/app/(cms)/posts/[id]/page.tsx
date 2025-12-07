"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Loader2, Globe, GlobeLock as GlobeOff, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePost, usePosts, type Post } from "@/lib/hooks/use-posts"
import { savePost, publishPost, deletePost as deletePostAction } from "@/lib/actions"
import { useTransition } from "react"
import debounce from "lodash.debounce"
import { ImageUploader } from "@/components/editor/image-uploader"
import { useToast } from "@/hooks/use-toast"

type SaveStatus = "idle" | "saving" | "saved"

export default function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === "new"
  const { post: initialPost } = usePost(isNew ? "1" : id)
  const { addPost, updatePost, deletePost } = usePosts()

  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    slug: "",
    content: "",
    coverImage: null,
    status: "draft",
  })
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [showPreview, setShowPreview] = useState(true)
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (initialPost && !isNew) {
      setPost(initialPost)
    }
  }, [initialPost, isNew])

  const debouncedSave = useCallback(
    debounce(async (postId: string, postData: Partial<Post>) => {
      if (!postData.title && !postData.content) return
      
      startTransition(async () => {
        setSaveStatus("saving")
        const result = await savePost(postId === "new" ? null : postId, {
          title: postData.title || "",
          slug: postData.slug || generateSlug(postData.title || ""),
          excerpt: postData.excerpt || "",
          content: postData.content || "",
          coverImage: postData.coverImage || null,
          status: (postData.status === "archived" ? "draft" : postData.status) || "draft",
        })
        
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          setSaveStatus("idle")
        } else {
          setSaveStatus("saved")
          setTimeout(() => setSaveStatus("idle"), 2000)
          // If new post was created, update the ID
          if (isNew && result.data) {
            router.replace(`/posts/${result.data.id}`)
          }
        }
      })
    }, 1000),
    [toast, isNew, router]
  )

  useEffect(() => {
    if (post.title || post.content) {
      debouncedSave(id, post)
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [post, debouncedSave, id])

  const handlePublish = async () => {
    if (isNew) {
      // Save first if new
      const saveResult = await savePost(null, {
        title: post.title || "",
        slug: post.slug || generateSlug(post.title || ""),
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage: post.coverImage || null,
        status: "published",
      })
      
      if (saveResult.error || !saveResult.data) {
        toast({
          title: "Error",
          description: saveResult.error || "Failed to save post",
          variant: "destructive",
        })
        return
      }
      
      router.replace(`/posts/${saveResult.data.id}`)
      setPost((prev) => ({ ...prev, status: "published", id: saveResult.data.id }))
      toast({
        title: "Published",
        description: "Post is now live",
      })
      return
    }

    startTransition(async () => {
      const newStatus = post.status === "published" ? "draft" : "published"
      
      if (newStatus === "published") {
        const result = await publishPost(id)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }
      } else {
        // Set to draft by saving with draft status
        const result = await savePost(id, {
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          coverImage: post.coverImage || null,
          status: "draft",
        })
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }
      }

      setPost((prev) => ({ ...prev, status: newStatus }))
      updatePost(id, { status: newStatus, publishedAt: newStatus === "published" ? new Date().toISOString() : null })
      
      toast({
        title: newStatus === "published" ? "Published" : "Unpublished",
        description: newStatus === "published" ? "Post is now live" : "Post is now a draft",
      })
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return
    
    if (isNew) {
      router.push("/posts")
      return
    }

    startTransition(async () => {
      const result = await deletePostAction(id)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        deletePost(id)
        router.push("/posts")
        toast({
          title: "Deleted",
          description: "Post deleted successfully",
        })
      }
    })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/posts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{isNew ? "Νέο Άρθρο" : post.title || "Χωρίς τίτλο"}</h1>
            <p className="text-sm text-muted-foreground">{post.slug ? `/${post.slug}` : "/untitled"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {saveStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Αποθήκευση...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    Αποθηκεύτηκε
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-2 rounded-xl">
            <Eye className="h-4 w-4" />
            {showPreview ? "Απόκρυψη" : "Προεπισκόπηση"}
          </Button>

          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2 rounded-xl text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Διαγραφή
            </Button>
          )}

          <Button
            onClick={handlePublish}
            variant={post.status === "published" ? "secondary" : "default"}
            size="sm"
            className="gap-2 rounded-xl"
          >
            {post.status === "published" ? (
              <>
                <GlobeOff className="h-4 w-4" />
                Αποδημοσίευση
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Δημοσίευση
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Edit Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label>Τίτλος</Label>
              <Input
                value={post.title || ""}
                onChange={(e) => {
                  const title = e.target.value
                  setPost((prev) => ({
                    ...prev,
                    title,
                    slug: prev.slug || generateSlug(title),
                  }))
                }}
                placeholder="Τίτλος άρθρου"
                className="rounded-xl text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={post.slug || ""}
                onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="post-slug"
                className="rounded-xl font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Εικόνα Εξωφύλλου</Label>
              <ImageUploader
                value={post.coverImage || ""}
                onChange={(v) => setPost((prev) => ({ ...prev, coverImage: v }))}
                className="aspect-video rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Περιεχόμενο (Markdown)</Label>
              <Textarea
                value={post.content || ""}
                onChange={(e) => setPost((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Γράψτε το περιεχόμενο σε Markdown..."
                className="min-h-[400px] rounded-xl font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-y-auto border-l border-border bg-muted/30"
            >
              <div className="p-6">
                <p className="mb-4 text-sm font-medium text-muted-foreground">Προεπισκόπηση</p>
                <article className="prose prose-sm dark:prose-invert">
                  {post.coverImage && (
                    <img
                      src={post.coverImage || "/placeholder.svg"}
                      alt=""
                      className="mb-6 aspect-video w-full rounded-xl object-cover"
                    />
                  )}
                  <h1 className="text-2xl font-bold">{post.title || "Χωρίς τίτλο"}</h1>
                  <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
                    {post.content || "Ξεκινήστε να γράφετε για να δείτε την προεπισκόπηση..."}
                  </div>
                </article>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
