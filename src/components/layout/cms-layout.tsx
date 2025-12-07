"use client"

import { type ReactNode, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { FileText, Newspaper } from "lucide-react"
import Link from "next/link"

interface CMSLayoutProps {
  children: ReactNode
}

export function CMSLayout({ children }: CMSLayoutProps) {
  const [showNewModal, setShowNewModal] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[72px] md:pl-60">
        <Topbar onNewClick={() => setShowNewModal(true)} />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Create New">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/pages/new/edit" onClick={() => setShowNewModal(false)}>
            <Button
              variant="outline"
              className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-transparent"
            >
              <FileText className="h-6 w-6" />
              <span>New Page</span>
            </Button>
          </Link>
          <Link href="/posts/new" onClick={() => setShowNewModal(false)}>
            <Button
              variant="outline"
              className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-transparent"
            >
              <Newspaper className="h-6 w-6" />
              <span>New Post</span>
            </Button>
          </Link>
        </div>
      </Modal>
    </div>
  )
}
