"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ExternalLink, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getTenantById } from "@/actions/tenants"
import { updateTenant, deleteTenant } from "@/actions/updateTenant"

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required").url("Domain must be a valid URL (e.g., https://example.com)"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #6366f1)").default("#6366f1"),
  defaultLocale: z.enum(["en", "el"], { required_error: "Locale is required" }),
})

type TenantFormData = z.infer<typeof tenantSchema>

export default function EditTenantPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tenantId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tenant, setTenant] = useState<{
    id: string
    name: string
    domain: string
    brandColor: string
    defaultLocale: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      brandColor: "#6366f1",
      defaultLocale: "en",
    },
  })

  const formData = watch()

  useEffect(() => {
    async function fetchTenant() {
      setIsLoading(true)
      const result = await getTenantById(tenantId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        router.push("/tenants")
        return
      }

      if (result.data) {
        setTenant(result.data)
        setValue("name", result.data.name)
        setValue("domain", result.data.domain)
        setValue("brandColor", result.data.brandColor || "#6366f1")
        setValue("defaultLocale", result.data.defaultLocale || "en")
      }

      setIsLoading(false)
    }

    if (tenantId) {
      fetchTenant()
    }
  }, [tenantId, setValue, router, toast])

  const onSubmit = async (data: TenantFormData) => {
    if (!tenant) return

    setIsSaving(true)
    try {
      const result = await updateTenant(tenant.id, {
        name: data.name,
        domain: data.domain,
        brandColor: data.brandColor,
        defaultLocale: data.defaultLocale,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Tenant settings updated successfully",
        })
        // Update local state
        setTenant({
          ...tenant,
          name: data.name,
          domain: data.domain,
          brandColor: data.brandColor,
          defaultLocale: data.defaultLocale,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tenant",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tenant) return

    if (!confirm(`Are you sure you want to delete "${tenant.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteTenant(tenant.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Tenant deleted successfully",
        })
        router.push("/tenants")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete tenant",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading tenant...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Tenant not found.</p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link href="/tenants">Back to Tenants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="mb-6">
        <Button variant="ghost" size="icon" asChild className="mb-4 rounded-xl">
          <Link href="/tenants">
            ← Back
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Edit Tenant</h1>
            <p className="text-muted-foreground mt-2">Update tenant settings and configuration</p>
          </div>
          {tenant.domain && (
            <Button asChild variant="outline" className="rounded-xl">
              <a href={tenant.domain} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Site
              </a>
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle>Tenant Settings</CardTitle>
            <CardDescription>Update the tenant information and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">
                Tenant Name <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Display name for this tenant
              </p>
              <Input
                id="name"
                {...register("name")}
                placeholder="Kalitechnia"
                className="rounded-xl"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="domain" className="text-base font-medium">
                Domain <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Full URL where the site will be hosted (e.g., https://kalitechnia.gr)
              </p>
              <Input
                id="domain"
                {...register("domain")}
                placeholder="https://kalitechnia.gr"
                type="url"
                className="rounded-xl"
              />
              {errors.domain && (
                <p className="mt-1 text-sm text-destructive">{errors.domain.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brandColor" className="text-base font-medium">
                Brand Color
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Primary brand color for this tenant
              </p>
              <div className="flex gap-3">
                <Input
                  id="brandColor"
                  {...register("brandColor")}
                  type="color"
                  className="h-12 w-24 rounded-xl cursor-pointer"
                />
                <Input
                  {...register("brandColor")}
                  placeholder="#6366f1"
                  className="rounded-xl flex-1"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              {errors.brandColor && (
                <p className="mt-1 text-sm text-destructive">{errors.brandColor.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="defaultLocale" className="text-base font-medium">
                Default Locale <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Default language for this tenant
              </p>
              <Select
                value={formData.defaultLocale}
                onValueChange={(value) => setValue("defaultLocale", value as "en" | "el")}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (en)</SelectItem>
                  <SelectItem value="el">Greek (el)</SelectItem>
                </SelectContent>
              </Select>
              {errors.defaultLocale && (
                <p className="mt-1 text-sm text-destructive">{errors.defaultLocale.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tenant
              </>
            )}
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

