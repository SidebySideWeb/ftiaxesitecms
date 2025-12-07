import type React from "react"
import { CMSLayout } from "@/components/layout/cms-layout"
import { CMSLayoutWrapper } from "@/components/CMSLayoutWrapper"

export default function CMSRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CMSLayoutWrapper>
      <CMSLayout>{children}</CMSLayout>
    </CMSLayoutWrapper>
  )
}

