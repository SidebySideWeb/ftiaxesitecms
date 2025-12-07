"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Moon, Sun, ChevronDown, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTenants, type Tenant } from "@/lib/hooks/use-tenants"
import { useDarkMode } from "@/lib/hooks/use-dark-mode"
import { useSession } from "@/lib/session-context"
import { useTenant } from "@/lib/tenant-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopbarProps {
  onNewClick?: () => void
}

export function Topbar({ onNewClick }: TopbarProps) {
  const router = useRouter()
  const { user, supabase } = useSession()
  const { tenant, setTenantId } = useTenant()
  const { tenants, activeTenant, setActiveTenant } = useTenants()
  const { isDark, toggle } = useDarkMode()
  const [tenantOpen, setTenantOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const displayTenant = activeTenant || tenant || { name: "Loading...", brandColor: "#6366f1" }
  const userEmail = user?.email || "User"
  const userInitials = userEmail
    .split("@")[0]
    .split(".")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <DropdownMenu open={tenantOpen} onOpenChange={setTenantOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: displayTenant.brandColor }} />
              <span className="max-w-32 truncate">{displayTenant.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-xl">
            {tenants.length > 0 ? (
              tenants.map((t: Tenant) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => {
                    setActiveTenant(t)
                    setTenantId(t.id)
                  }}
                  className="gap-2 rounded-lg"
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.brandColor }} />
                  <span>{t.name}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="rounded-lg">
                No tenants available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? "dark" : "light"}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </AnimatePresence>
        </Button>

        <Button onClick={onNewClick} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          New
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={userEmail} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 rounded-lg">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 rounded-lg text-destructive">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
