"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { FileText, Newspaper, Globe, Plus, ArrowRight, BarChart3, Eye, Sparkles, Rocket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePages } from "@/lib/hooks/use-pages"
import { usePosts } from "@/lib/hooks/use-posts"
import { useTenant } from "@/lib/tenant-context"
import { useTenants } from "@/lib/hooks/use-tenants"

export default function DashboardPage() {
  const router = useRouter()
  const { pages, isLoading: pagesLoading } = usePages()
  const { posts, isLoading: postsLoading } = usePosts()
  const { tenant } = useTenant()
  const { tenants, isLoading: tenantsLoading } = useTenants()

  const recentPages = pages.slice(0, 3)
  const recentPosts = posts.slice(0, 3)

  const publishedPages = pages.filter((p) => p.status === "published").length
  const publishedPosts = posts.filter((p) => p.status === "published").length

  const activeTenant = tenant || { name: "Loading...", brandColor: "#6366f1", domain: "", createdAt: new Date() }

  // Show onboarding if user has no tenants
  if (!tenantsLoading && tenants.length === 0 && !pagesLoading && !postsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-2xl px-4"
        >
          <Card className="rounded-2xl border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Welcome to Side by Side CMS</CardTitle>
              <CardDescription className="text-base">
                Create your first presentation site to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-border bg-muted/50 p-6">
                <h3 className="mb-4 font-semibold">What you'll get:</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span>A fully configured tenant with default settings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span>A draft Home page with Hero and Posts Feed sections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span>Global settings (header, footer, navigation) ready to customize</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span>Owner access to manage your site</span>
                  </li>
                </ul>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full rounded-xl"
                onClick={() => router.push("/tenants/new")}
              >
                <Link href="/tenants/new">
                  <Rocket className="mr-2 h-5 w-5" />
                  Create Your First Site
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                This wizard will guide you through setting up your site in 3 simple steps
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (pagesLoading || postsLoading || tenantsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome to CMS</h1>
          <p className="text-muted-foreground">Manage {activeTenant.name}</p>
        </div>
        <div className="flex gap-2">
          {tenants.length > 0 && (
            <Button asChild variant="outline" className="gap-2 rounded-xl">
              <Link href="/tenants/new">
                <Plus className="h-4 w-4" />
                New Site
              </Link>
            </Button>
          )}
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/pages/new/edit">
              <Plus className="h-4 w-4" />
              New Page
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{publishedPages} published</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{publishedPosts} published</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600">+12% from yesterday</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">3.2%</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600">+0.5% from last week</p>
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
              Active Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{activeTenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-medium">{activeTenant.slug || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="mb-4 text-lg font-medium">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/pages/new/edit">
            <Card className="group cursor-pointer rounded-2xl border-border transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New Page</p>
                  <p className="text-sm text-muted-foreground">Create a new page</p>
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
                  <p className="font-medium">New Post</p>
                  <p className="text-sm text-muted-foreground">Write a blog post</p>
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
                  <p className="font-medium">Site Settings</p>
                  <p className="text-sm text-muted-foreground">Edit global settings</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Recent Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Pages</CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/pages">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pages yet</p>
              ) : (
                recentPages.map((page) => (
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
                      {page.status === "published" ? "Published" : "Draft"}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Posts</CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/posts">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet</p>
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        post.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

