"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function TenantSuccessPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenant")
  const domain = searchParams.get("domain")
  const { toast } = useToast()

  useEffect(() => {
    // Show success toast on mount
    if (tenantId && domain) {
      toast({
        title: "Success!",
        description: "Tenant created successfully",
      })
    }
  }, [tenantId, domain, toast])

  if (!tenantId || !domain) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Invalid tenant information. Please try again.</p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link href="/tenants/new">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Create Tenant
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="rounded-2xl border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">✅ Tenant created successfully</CardTitle>
          <CardDescription>
            Your new tenant has been created and you've been assigned as the owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant ID:</span>
                <span className="font-medium">{tenantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domain:</span>
                <span className="font-medium">{domain}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full rounded-xl">
              <Link href={`/dashboard?tenant=${encodeURIComponent(tenantId)}`}>
                Open CMS
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full rounded-xl">
              <a href={domain} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                View Live Site
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full rounded-xl">
              <Link href="/tenants">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tenants
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

