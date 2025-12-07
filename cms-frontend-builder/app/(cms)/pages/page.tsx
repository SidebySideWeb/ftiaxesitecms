"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/datatable"
import { usePages, type Page } from "@/lib/hooks/use-pages"
import { Badge } from "@/components/ui/badge"

export default function PagesListPage() {
  const router = useRouter()
  const { pages, deletePage, isLoading } = usePages()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη σελίδα;")) {
      deletePage(id)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Τίτλος",
      render: (row: Page) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      render: (row: Page) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.slug}</code>,
    },
    {
      key: "status",
      label: "Κατάσταση",
      render: (row: Page) => (
        <Badge variant={row.status === "published" ? "default" : "secondary"} className="rounded-full">
          {row.status === "published" ? "Δημοσιευμένη" : "Πρόχειρο"}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      label: "Ενημέρωση",
      render: (row: Page) => (
        <span className="text-muted-foreground">{new Date(row.updatedAt).toLocaleDateString("el-GR")}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: Page) => (
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
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Φόρτωση...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Σελίδες</h1>
          <p className="text-muted-foreground">Διαχειριστείτε τις σελίδες του site</p>
        </div>
      </div>

      <DataTable
        data={pages}
        columns={columns}
        searchKey="title"
        onRowClick={(row) => router.push(`/pages/${row.id}/edit`)}
      />

      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => router.push("/pages/new/edit")}
          size="lg"
          className="h-14 gap-2 rounded-2xl px-6 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Νέα Σελίδα
        </Button>
      </motion.div>
    </div>
  )
}
