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
import { useSession } from "@/lib/session-context"
import { supabaseBrowser } from "@/lib/supabase"

export default function SettingsPage() {
  const { user } = useSession()
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
    email: user?.email || "",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [copied, setCopied] = useState(false)
  const [apiKey, setApiKey] = useState("cms_api_" + (user?.id?.slice(0, 8) || "xxxxxxxx"))
  const { toast } = useToast()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileSave = async () => {
    if (!user) return
    
    setIsUpdatingProfile(true)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure the new passwords match",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        })
        setPasswords({ current: "", new: "", confirm: "" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const regenerateApiKey = () => {
    const newKey = `cms_api_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`
    setApiKey(newKey)
    toast({
      title: "New API Key",
      description: "A new API key has been generated",
    })
  }

  const userInitials = user?.email
    ?.split("@")[0]
    .split(".")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Profile</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={profile.name} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="rounded-xl bg-transparent" disabled>
                  Change Avatar
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="rounded-xl bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button 
                onClick={handleProfileSave} 
                className="rounded-xl"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
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
                  <CardTitle className="text-lg">Password</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  className="rounded-xl"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="rounded-xl"
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={!passwords.new || !passwords.confirm || isChangingPassword}
                className="rounded-xl"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
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
                  <CardDescription>Manage API keys for integrations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API Key</p>
                    <p className="font-mono text-sm text-muted-foreground">{apiKey.slice(0, 30)}...</p>
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
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
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
                      Regenerate
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Use this key for API authentication. Keep it secret and never share it publicly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

