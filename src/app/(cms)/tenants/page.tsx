"use client"

import Link from "next/link"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTenants } from "@/lib/hooks/use-tenants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TenantsPage() {
  const { tenants, isLoading } = useTenants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <p className="text-muted-foreground">Manage your tenant sites</p>
        </div>
        <Button asChild className="gap-2 rounded-xl">
          <Link href="/tenants/new">
            <Plus className="h-4 w-4" />
            ➕ New Tenant
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>View and manage all your tenant sites</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No tenants found.</p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/tenants/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tenant
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-mono text-sm">{tenant.slug || tenant.id}</TableCell>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        {tenant.domain ? (
                          <a
                            href={tenant.domain}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {tenant.domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No domain set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tenant.created_at
                          ? new Date(tenant.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={`/tenants/${tenant.slug || tenant.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          {tenant.domain && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                              <a
                                href={tenant.domain}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Site
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

