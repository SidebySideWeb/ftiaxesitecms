"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FileText, Newspaper, Globe, Plus, ArrowRight, BarChart3, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePages } from "@/lib/hooks/use-pages"
import { usePosts } from "@/lib/hooks/use-posts"
import { useTenants } from "@/lib/hooks/use-tenants"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  const { pages } = usePages()
  const { posts } = usePosts()
  const { activeTenant } = useTenants()

  if (!activeTenant) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Φόρτωση...</p>
      </div>
    )
  }

  const recentPages = pages.slice(0, 3)
  const recentPosts = posts.slice(0, 3)

  const publishedPages = pages.filter((p) => p.status === "published").length
  const publishedPosts = posts.filter((p) => p.status === "published").length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Καλωσήρθατε στο ftiaxesite.gr</h1>
          <p className="text-muted-foreground">Διαχειριστείτε το {activeTenant.name}</p>
        </div>
        <Button asChild className="gap-2 rounded-xl">
          <Link href="/tenants">
            <Plus className="h-4 w-4" />
            Νέο Site
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Σελίδες</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{publishedPages} δημοσιευμένες</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Άρθρα</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{publishedPosts} δημοσιευμένα</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Επισκέψεις</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600">+12% από χθες</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Μετατροπές</p>
                  <p className="text-2xl font-bold">3.2%</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600">+0.5% από την προηγούμενη εβδομάδα</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tenant Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: activeTenant.brandColor }} />
              Ενεργό Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Όνομα</p>
                <p className="font-medium">{activeTenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Domain</p>
                <p className="font-medium">{activeTenant.domain}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Δημιουργήθηκε</p>
                <p className="font-medium">{new Date(activeTenant.created_at || activeTenant.createdAt || Date.now()).toLocaleDateString("el-GR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Updated labels */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="mb-4 text-lg font-medium">Γρήγορες Ενέργειες</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/pages/new/edit">
            <Card className="group cursor-pointer rounded-2xl border-border transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Νέα Σελίδα</p>
                  <p className="text-sm text-muted-foreground">Δημιουργήστε νέα σελίδα</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/posts/new">
            <Card className="group cursor-pointer rounded-2xl border-border transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Νέο Άρθρο</p>
                  <p className="text-sm text-muted-foreground">Γράψτε blog post</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/globals">
            <Card className="group cursor-pointer rounded-2xl border-border transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Ρυθμίσεις Site</p>
                  <p className="text-sm text-muted-foreground">Επεξεργασία globals</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Recent Items - Updated labels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Πρόσφατες Σελίδες</CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/pages">Όλες</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/pages/${page.id}/edit`}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-sm text-muted-foreground">{page.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      page.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {page.status === "published" ? "Δημοσιευμένη" : "Πρόχειρο"}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Πρόσφατα Άρθρα</CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/posts">Όλα</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("el-GR") : "Πρόχειρο"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      post.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status === "published" ? "Δημοσιευμένο" : "Πρόχειρο"}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
