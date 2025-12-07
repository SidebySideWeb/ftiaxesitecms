"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Lock, Key, Copy, Check, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Διαχειριστής",
    email: "admin@ftiaxesite.gr",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [copied, setCopied] = useState(false)
  const [apiKey, setApiKey] = useState("fts_sk_live_xxxxxxxxxxxxxxxxxxxx")
  const { toast } = useToast()

  const handleProfileSave = () => {
    toast({
      title: "Προφίλ ενημερώθηκε",
      description: "Οι αλλαγές αποθηκεύτηκαν επιτυχώς",
    })
  }

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Οι κωδικοί δεν ταιριάζουν",
        description: "Βεβαιωθείτε ότι οι νέοι κωδικοί είναι ίδιοι",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Κωδικός άλλαξε",
      description: "Ο κωδικός σας ενημερώθηκε επιτυχώς",
    })
    setPasswords({ current: "", new: "", confirm: "" })
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerateApiKey = () => {
    const newKey = `fts_sk_live_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`
    setApiKey(newKey)
    toast({
      title: "Νέο API Key",
      description: "Δημιουργήθηκε νέο API key",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ρυθμίσεις</h1>
        <p className="text-muted-foreground">Διαχειριστείτε τον λογαριασμό σας</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Προφίλ</CardTitle>
                  <CardDescription>Ενημερώστε τα στοιχεία σας</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                  <AvatarFallback>ΔΧ</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  Αλλαγή Avatar
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Όνομα</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleProfileSave} className="rounded-xl">
                Αποθήκευση
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Κωδικός</CardTitle>
                  <CardDescription>Αλλάξτε τον κωδικό πρόσβασης</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Τρέχων Κωδικός</Label>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Νέος Κωδικός</Label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Επιβεβαίωση Νέου Κωδικού</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
                className="rounded-xl"
              >
                Αλλαγή Κωδικού
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">API Keys</CardTitle>
                  <CardDescription>Διαχειριστείτε τα API keys για integrations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Live API Key</p>
                    <p className="font-mono text-sm text-muted-foreground">{apiKey.slice(0, 20)}...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyApiKey}
                      className="gap-2 rounded-lg bg-transparent"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Αντιγράφηκε
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Αντιγραφή
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateApiKey}
                      className="gap-2 rounded-lg bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Ανανέωση
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Χρησιμοποιήστε αυτό το key για authentication στο API. Κρατήστε το μυστικό.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
