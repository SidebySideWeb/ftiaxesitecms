"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Globe, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { useTenants, type Tenant } from "@/lib/hooks/use-tenants"
import { createTenant, linkUserToTenant } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@/lib/session-context"
import { useTenant } from "@/lib/tenant-context"

export default function TenantsPage() {
  const { tenants, setTenants, setActiveTenant, activeTenant, isLoading } = useTenants()
  const { setTenantId } = useTenant()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTenant, setNewTenant] = useState({ name: "", domain: "", brandColor: "#0d9488" })
  const [isCreating, setIsCreating] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const { toast } = useToast()
  const { user } = useSession()
  
  // Sync activeTenant with TenantContext
  const handleSetActiveTenant = (tenant: Tenant) => {
    setActiveTenant(tenant)
    setTenantId(tenant.id)
    toast({
      title: "Tenant selected",
      description: `Switched to ${tenant.name}`,
    })
  }

  const handleCreate = async () => {
    if (!newTenant.name || !newTenant.domain) return

    setIsCreating(true)
    const result = await createTenant(newTenant)
    if (result.success) {
      // Generate slug from name (same logic as createTenant server action)
      const slug = newTenant.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      
      const tenant: Tenant = {
        id: result.id,
        name: newTenant.name,
        slug: slug,
        domain: newTenant.domain,
        brandColor: newTenant.brandColor,
        createdAt: new Date().toISOString(),
      }
      setTenants((prev) => [...prev, tenant])
      toast({
        title: "Site δημιουργήθηκε",
        description: `Το ${newTenant.name} δημιουργήθηκε επιτυχώς`,
      })
      setShowCreateModal(false)
      setNewTenant({ name: "", domain: "", brandColor: "#0d9488" })
    }
    setIsCreating(false)
  }

  const handleDelete = (tenant: Tenant) => {
    if (activeTenant && tenant.id === activeTenant.id) {
      toast({
        title: "Σφάλμα",
        description: "Δεν μπορείτε να διαγράψετε το ενεργό site",
        variant: "destructive",
      })
      return
    }
    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το "${tenant.name}";`)) {
      setTenants((prev) => prev.filter((t) => t.id !== tenant.id))
      toast({
        title: "Διαγράφηκε",
        description: `Το ${tenant.name} διαγράφηκε`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Τα Sites μου</h1>
          <p className="text-muted-foreground">Διαχειριστείτε τα websites σας</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Νέο Site
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Φόρτωση...</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <p className="text-muted-foreground mb-4">Δεν έχετε ακόμα sites</p>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Δημιουργία πρώτου Site
            </Button>
            {process.env.NODE_ENV === "development" && (
              <Button 
                onClick={async () => {
                  if (!user) return
                  setIsLinking(true)
                  // Try to link to common tenant slugs
                  const commonSlugs = ["kalitechnia"]
                  let linked = false
                  for (const slug of commonSlugs) {
                    const result = await linkUserToTenant(slug, "owner")
                    if (result.success) {
                      linked = true
                      toast({
                        title: "Σύνδεση επιτυχής",
                        description: `Συνδεθήκατε στο tenant: ${slug}`,
                      })
                      // Refresh the page to reload tenants
                      window.location.reload()
                      break
                    }
                  }
                  if (!linked) {
                    toast({
                      title: "Δεν βρέθηκε tenant",
                      description: "Δοκιμάστε να δημιουργήσετε ένα νέο site",
                      variant: "destructive",
                    })
                  }
                  setIsLinking(false)
                }}
                disabled={isLinking}
                variant="outline"
                className="gap-2 rounded-xl"
              >
                {isLinking ? "Σύνδεση..." : "Σύνδεση με υπάρχον tenant (dev)"}
              </Button>
            )}
          </div>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-muted-foreground mt-2">
              Αν υπάρχει tenant στη βάση αλλά δεν εμφανίζεται, χρησιμοποιήστε το κουμπί "Σύνδεση"
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant, i) => (
          <motion.div
            key={tenant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`group cursor-pointer rounded-2xl border-border transition-all hover:shadow-md ${activeTenant && tenant.id === activeTenant.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary"}`}
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${tenant.brandColor}20` }}
                  >
                    <Globe className="h-6 w-6" style={{ color: tenant.brandColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTenant && tenant.id === activeTenant.id && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Ενεργό
                      </span>
                    )}
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: tenant.brandColor }}
                      title={tenant.brandColor}
                    />
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-semibold">{tenant.name}</h3>
                <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                  {tenant.domain}
                  <ExternalLink className="h-3 w-3" />
                </p>
                <p className="text-xs text-muted-foreground">
                  Δημιουργήθηκε {new Date(tenant.createdAt || tenant.created_at || Date.now()).toLocaleDateString("el-GR")}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant={tenant.id === activeTenant?.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSetActiveTenant(tenant)}
                    className="flex-1 rounded-lg"
                    disabled={!!(activeTenant && tenant.id === activeTenant.id)}
                  >
                    {activeTenant && tenant.id === activeTenant.id ? "Επιλεγμένο" : "Επιλογή"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tenant)}
                    className="rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Δημιουργία Site">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Όνομα</Label>
            <Input
              value={newTenant.name}
              onChange={(e) => setNewTenant((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Η Εταιρεία μου"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input
              value={newTenant.domain}
              onChange={(e) => setNewTenant((prev) => ({ ...prev, domain: e.target.value }))}
              placeholder="mycompany.gr"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Χρώμα Brand</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newTenant.brandColor}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, brandColor: e.target.value }))}
                className="h-10 w-20 cursor-pointer rounded-xl p-1"
              />
              <Input
                value={newTenant.brandColor}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, brandColor: e.target.value }))}
                placeholder="#0d9488"
                className="flex-1 rounded-xl font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl">
              Ακύρωση
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newTenant.name || !newTenant.domain}
              className="rounded-xl"
            >
              {isCreating ? "Δημιουργία..." : "Δημιουργία"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
