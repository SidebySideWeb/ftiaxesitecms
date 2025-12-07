"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, History, Copy, Sparkles, Globe, GlobeLock as GlobeOff, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePageBlocks, usePage, usePages, type Block } from "@/lib/hooks/use-pages"
import { savePageSections, publishPage, setDraft, clonePage, restoreVersion, listVersions } from "@/lib/actions"
import { useTransition } from "react"
import debounce from "lodash.debounce"
import { BlockList } from "@/components/editor/block-list"
import { BlockEditor } from "@/components/editor/block-editor"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type SaveStatus = "idle" | "saving" | "saved"

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { page } = usePage(id === "new" ? "1" : id)
  const { blocks, setBlocks } = usePageBlocks(id === "new" ? "1" : id)
  const { deletePage } = usePages()
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [isPublished, setIsPublished] = useState(page?.status === "published")
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [versions, setVersions] = useState<any[]>([])
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  // Convert blocks to sections format for savePageSections
  const blocksToSections = (blocksToSave: Block[]) => {
    return blocksToSave.map((block) => ({
      type: block.type,
      props: block.data || block.props || {},
    }))
  }

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (blocksToSave: Block[]) => {
      if (id === "new") return
      
      startTransition(async () => {
        setSaveStatus("saving")
        const sections = blocksToSections(blocksToSave)
        const result = await savePageSections(id, sections)
        
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
        }
      })
    }, 1000),
    [id, toast]
  )

  useEffect(() => {
    if (blocks.length > 0 && id !== "new") {
      debouncedSave(blocks)
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [blocks, debouncedSave, id])

  const handleBlockUpdate = (blockId: string, newData: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b)))
  }

  const handleReorder = (newBlocks: Block[]) => {
    setBlocks(newBlocks)
    // Save will be triggered by useEffect
  }

  const handleAddBlock = (type: Block["type"], afterId?: string) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      data: getDefaultBlockData(type),
    }

    if (afterId) {
      const index = blocks.findIndex((b) => b.id === afterId)
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, newBlock)
      setBlocks(newBlocks)
    } else {
      setBlocks([...blocks, newBlock])
    }
    setSelectedBlockId(newBlock.id)
  }

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (selectedBlockId === blockId) setSelectedBlockId(null)
  }

  const handlePublish = async () => {
    if (id === "new") {
      toast({
        title: "Error",
        description: "Please save the page first",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const newStatus = !isPublished
      
      if (newStatus) {
        const result = await publishPage(id)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }
      } else {
        const result = await setDraft(id)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }
      }

      setIsPublished(newStatus)
      toast({
        title: newStatus ? "Published" : "Unpublished",
        description: newStatus ? "Page is now live" : "Page is now a draft",
      })
    })
  }

  const handleClone = async () => {
    if (id === "new" || !page) {
      toast({
        title: "Error",
        description: "Cannot clone a new page",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const newSlug = `${page.slug}-copy`
      const result = await clonePage(id, newSlug, `${page.title} (Copy)`)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.data) {
        toast({
          title: "Cloned",
          description: "Page cloned successfully",
        })
        router.push(`/pages/${result.data.id}/edit`)
      }
    })
  }

  const handleDelete = () => {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σελίδα;")) {
      deletePage(id)
      router.push("/pages")
      toast({
        title: "Διαγράφηκε",
        description: "Η σελίδα διαγράφηκε επιτυχώς",
      })
    }
  }

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return
    toast({
      title: "AI Generation",
      description: "Η δημιουργία με AI θα συνδεθεί σύντομα",
    })
    setShowAIModal(false)
    setAiPrompt("")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/pages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{page?.title || "Νέα Σελίδα"}</h1>
            <p className="text-sm text-muted-foreground">{page?.slug || "/new-page"}</p>
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

          <Button variant="outline" size="sm" onClick={() => setShowAIModal(true)} className="gap-2 rounded-xl">
            <Sparkles className="h-4 w-4" />
            AI
          </Button>

          <Button variant="outline" size="sm" onClick={handleClone} className="gap-2 rounded-xl bg-transparent">
            <Copy className="h-4 w-4" />
            Αντιγραφή
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(true)} className="gap-2 rounded-xl">
            <History className="h-4 w-4" />
            Ιστορικό
          </Button>

          {id !== "new" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2 rounded-xl text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            onClick={handlePublish}
            variant={isPublished ? "secondary" : "default"}
            size="sm"
            className="gap-2 rounded-xl"
          >
            {isPublished ? (
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
        {/* Live Preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-sm">
            <BlockList
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelect={setSelectedBlockId}
              onReorder={handleReorder}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
              onBlockUpdate={handleBlockUpdate}
            />
            {blocks.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
                <p>Δεν υπάρχουν blocks. Προσθέστε το πρώτο σας block.</p>
                <Button onClick={() => handleAddBlock("hero")} variant="outline" className="rounded-xl">
                  Προσθήκη Hero Block
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Block Inspector Panel */}
        <div className="w-80 shrink-0 overflow-y-auto border-l border-border bg-card p-4">
          <AnimatePresence mode="wait">
            {selectedBlock ? (
              <motion.div
                key={selectedBlock.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <BlockEditor block={selectedBlock} onUpdate={(data) => handleBlockUpdate(selectedBlock.id, data)} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center text-center text-muted-foreground"
              >
                <p>Επιλέξτε block για επεξεργασία</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Version History Modal */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Version History">
        <VersionHistory pageId={id} onRestore={() => setShowHistoryModal(false)} />
      </Modal>

      {/* AI Generate Modal */}
      <Modal open={showAIModal} onClose={() => setShowAIModal(false)} title="Δημιουργία με AI">
        <div className="space-y-4">
          <Textarea
            placeholder="Περιγράψτε το section που θέλετε να δημιουργήσετε..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            className="rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAIModal(false)} className="rounded-xl">
              Ακύρωση
            </Button>
            <Button onClick={handleAIGenerate} className="rounded-xl">
              Δημιουργία
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function VersionHistory({ pageId, onRestore }: { pageId: string; onRestore: () => void }) {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { setBlocks } = usePageBlocks(pageId)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (pageId === "new") {
      setLoading(false)
      return
    }

    async function fetchVersions() {
      setLoading(true)
      const result = await listVersions(pageId)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const formattedVersions = (result.data || []).map((v: any) => ({
        id: v.id,
        date: new Date(v.created_at).toLocaleString(),
        version: v.version_number,
        content: v.content,
      }))

      setVersions(formattedVersions)
      setLoading(false)
    }

    fetchVersions()
  }, [pageId, toast])

  const handleRestore = async (versionId: string) => {
    startTransition(async () => {
      const result = await restoreVersion(pageId, versionId)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Reload blocks
      const version = versions.find((v) => v.id === versionId)
      if (version?.content?.sections) {
        const restoredBlocks = version.content.sections.map((section: any, index: number) => ({
          id: section.id || `block-${index}`,
          type: section.type,
          data: section.props || {},
          props: section.props || {},
        }))
        setBlocks(restoredBlocks)
      }

      toast({
        title: "Restored",
        description: "Version restored successfully",
      })
      onRestore()
      router.refresh()
    })
  }

  if (loading) {
    return <div className="text-center py-4">Loading versions...</div>
  }

  if (versions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No versions found</div>
  }

  return (
    <div className="space-y-2">
      {versions.map((version, i) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center justify-between rounded-xl border border-border p-3"
        >
          <div>
            <p className="font-medium">Version {version.version}</p>
            <p className="text-sm text-muted-foreground">{version.date}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestore(version.id)}
            disabled={isPending}
            className="rounded-lg bg-transparent"
          >
            Restore
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

function getDefaultBlockData(type: Block["type"]): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { title: "Νέο Hero Section", subtitle: "Προσθέστε τον υπότιτλο εδώ", image: "" }
    case "text-image":
      return { heading: "Νέος Τίτλος", text: "Προσθέστε το περιεχόμενό σας εδώ", image: "", imagePosition: "right" }
    case "gallery":
      return { images: [] }
    case "posts-feed":
      return { limit: 3, category: "" }
    case "cta":
      return { title: "Call to Action", buttonLabel: "Ξεκινήστε", buttonLink: "#" }
    default:
      return {}
  }
}
