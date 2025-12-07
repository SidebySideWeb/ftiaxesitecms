"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Loader2, Trash2, GripVertical } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useGlobals, type NavItem } from "@/lib/hooks/use-globals"
import { saveGlobals } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function GlobalsPage() {
  const { globals, setGlobals } = useGlobals()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    
    // Convert globals to the format expected by saveGlobals
    const globalsToSave = [
      { key: "navigation", value: globals.navigation, status: "published" },
      { key: "header", value: globals.header, status: "published" },
      { key: "footer", value: globals.footer, status: "published" },
      { key: "seo", value: globals.seo, status: "published" },
    ]

    const result = await saveGlobals(globalsToSave)
    
    setIsSaving(false)
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Saved",
        description: "Global settings saved successfully",
      })
    }
  }

  const updateNavItem = (index: number, updates: Partial<NavItem>) => {
    const newNav = [...globals.navigation]
    newNav[index] = { ...newNav[index], ...updates }
    setGlobals({ ...globals, navigation: newNav })
  }

  const addNavItem = () => {
    setGlobals({
      ...globals,
      navigation: [...globals.navigation, { id: crypto.randomUUID(), label: "Νέος Σύνδεσμος", href: "/" }],
    })
  }

  const removeNavItem = (index: number) => {
    setGlobals({
      ...globals,
      navigation: globals.navigation.filter((_, i) => i !== index),
    })
  }

  const moveNavItem = (index: number, direction: "up" | "down") => {
    const newNav = [...globals.navigation]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newNav.length) return
    ;[newNav[index], newNav[newIndex]] = [newNav[newIndex], newNav[index]]
    setGlobals({ ...globals, navigation: newNav })
  }

  const updateFooterLink = (index: number, updates: Partial<NavItem>) => {
    const newLinks = [...globals.footer.links]
    newLinks[index] = { ...newLinks[index], ...updates }
    setGlobals({ ...globals, footer: { ...globals.footer, links: newLinks } })
  }

  const addFooterLink = () => {
    setGlobals({
      ...globals,
      footer: {
        ...globals.footer,
        links: [...globals.footer.links, { id: crypto.randomUUID(), label: "Νέος Σύνδεσμος", href: "/" }],
      },
    })
  }

  const removeFooterLink = (index: number) => {
    setGlobals({
      ...globals,
      footer: {
        ...globals.footer,
        links: globals.footer.links.filter((_, i) => i !== index),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ρυθμίσεις Site</h1>
          <p className="text-muted-foreground">Διαχειριστείτε τις γενικές ρυθμίσεις</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Αποθήκευση...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Αποθήκευση
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="navigation" className="space-y-6">
        <TabsList className="rounded-xl bg-muted p-1">
          <TabsTrigger value="navigation" className="rounded-lg">
            Πλοήγηση
          </TabsTrigger>
          <TabsTrigger value="header" className="rounded-lg">
            Header
          </TabsTrigger>
          <TabsTrigger value="footer" className="rounded-lg">
            Footer
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg">
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigation" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-medium">Μενού Πλοήγησης</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Προσθέστε, επεξεργαστείτε και αναδιατάξτε τα στοιχεία του μενού
            </p>
            <div className="space-y-3">
              {globals.navigation.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveNavItem(i, "up")}
                      disabled={i === 0}
                      className="h-6 w-6 rounded"
                    >
                      <span className="text-xs">↑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveNavItem(i, "down")}
                      disabled={i === globals.navigation.length - 1}
                      className="h-6 w-6 rounded"
                    >
                      <span className="text-xs">↓</span>
                    </Button>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={item.label}
                    onChange={(e) => updateNavItem(i, { label: e.target.value })}
                    placeholder="Ετικέτα"
                    className="flex-1 rounded-lg"
                  />
                  <Input
                    value={item.href}
                    onChange={(e) => updateNavItem(i, { href: e.target.value })}
                    placeholder="/path"
                    className="flex-1 rounded-lg font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNavItem(i)}
                    className="h-10 w-10 shrink-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" onClick={addNavItem} className="w-full rounded-xl bg-transparent">
                + Προσθήκη Στοιχείου
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-medium">Ρυθμίσεις Header</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>URL Λογοτύπου</Label>
                <Input
                  value={globals.header.logo}
                  onChange={(e) => setGlobals({ ...globals, header: { ...globals.header, logo: e.target.value } })}
                  placeholder="/logo.png"
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Εμφάνιση Αναζήτησης</Label>
                  <p className="text-sm text-muted-foreground">Εμφάνιση πεδίου αναζήτησης στο header</p>
                </div>
                <Switch
                  checked={globals.header.showSearch}
                  onCheckedChange={(checked) =>
                    setGlobals({ ...globals, header: { ...globals.header, showSearch: checked } })
                  }
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-medium">Ρυθμίσεις Footer</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Κείμενο Copyright</Label>
                <Input
                  value={globals.footer.copyright}
                  onChange={(e) => setGlobals({ ...globals, footer: { ...globals.footer, copyright: e.target.value } })}
                  placeholder="© 2025 Εταιρεία"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Σύνδεσμοι Footer</Label>
                <div className="space-y-3">
                  {globals.footer.links.map((link, i) => (
                    <div key={link.id} className="flex items-center gap-3">
                      <Input
                        value={link.label}
                        onChange={(e) => updateFooterLink(i, { label: e.target.value })}
                        placeholder="Ετικέτα"
                        className="flex-1 rounded-xl"
                      />
                      <Input
                        value={link.href}
                        onChange={(e) => updateFooterLink(i, { href: e.target.value })}
                        placeholder="/path"
                        className="flex-1 rounded-xl font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFooterLink(i)}
                        className="h-10 w-10 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFooterLink} className="w-full rounded-xl bg-transparent">
                    + Προσθήκη Συνδέσμου
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-medium">SEO Προεπιλογές</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Πρότυπο Τίτλου</Label>
                <Input
                  value={globals.seo.titleTemplate}
                  onChange={(e) => setGlobals({ ...globals, seo: { ...globals.seo, titleTemplate: e.target.value } })}
                  placeholder="%s | Όνομα Site"
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Χρησιμοποιήστε %s ως placeholder για τον τίτλο σελίδας</p>
              </div>

              <div className="space-y-2">
                <Label>Προεπιλεγμένη Περιγραφή</Label>
                <Textarea
                  value={globals.seo.defaultDescription}
                  onChange={(e) =>
                    setGlobals({ ...globals, seo: { ...globals.seo, defaultDescription: e.target.value } })
                  }
                  placeholder="Προεπιλεγμένη meta description για τις σελίδες"
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Προεπιλεγμένη OG Image URL</Label>
                <Input
                  value={globals.seo.ogImage}
                  onChange={(e) => setGlobals({ ...globals, seo: { ...globals.seo, ogImage: e.target.value } })}
                  placeholder="/og-image.png"
                  className="rounded-xl font-mono text-sm"
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
