import type React from "react"
import { CMSLayout } from "@/components/layout/cms-layout"
import { CMSLayoutWrapper } from "../../../src/components/CMSLayoutWrapper"
import { TenantProvider } from "@/lib/tenant-context"

export default function CMSRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CMSLayoutWrapper>
      <TenantProvider>
        <CMSLayout>{children}</CMSLayout>
      </TenantProvider>
    </CMSLayoutWrapper>
  )
}
