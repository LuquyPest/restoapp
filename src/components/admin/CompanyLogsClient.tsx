"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { LogOut, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  action: string
  userId: string | null
  userEmail: string | null
  companyId: string | null
  ip: string | null
  metadata: string | null
  createdAt: string
}

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  LOGIN_SUCCESS:             { label: "Connexion OK",           variant: "default" },
  LOGIN_FAILED:              { label: "Connexion échouée",      variant: "destructive" },
  LOGOUT:                    { label: "Déconnexion",             variant: "secondary" },
  PASSWORD_CHANGED:          { label: "MDP modifié",            variant: "outline" },
  PASSWORD_RESET:            { label: "MDP réinitialisé",       variant: "outline" },
  EMPLOYEE_CREATED:          { label: "Employé créé",           variant: "default" },
  EMPLOYEE_DELETED:          { label: "Employé supprimé",       variant: "destructive" },
  PAYROLL_GENERATED:         { label: "Paie générée",           variant: "secondary" },
  ORDER_CANCELLED:           { label: "Commande annulée",       variant: "outline" },
  MENU_ITEM_DELETED:         { label: "Menu supprimé",          variant: "destructive" },
  INVOICE_DELETED:           { label: "Facture supprimée",      variant: "destructive" },
  CHARGE_DELETED:            { label: "Charge supprimée",       variant: "destructive" },
  RESTAURANT_RATES_MODIFIED: { label: "Taux modifiés",          variant: "outline" },
}

const ALL_ACTIONS = Object.keys(ACTION_LABELS)
const LIVE_INTERVAL = 5000

export default function CompanyLogsClient({
  companyId,
  companyName,
}: {
  companyId: string
  companyName: string
}) {
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const prevIdsRef = useRef<Set<string>>(new Set())
  const perPage = 50

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const params = new URLSearchParams({ page: String(page), companyId })
    if (action !== "all") params.set("action", action)
    if (debouncedSearch) params.set("search", debouncedSearch)
    const res = await fetch(`/api/admin/logs?${params}`)
    if (res.ok) {
      const data = await res.json()
      const fetched: AuditLog[] = data.logs
      // Detect new entries (only on page 1)
      if (page === 1) {
        const freshIds = new Set(fetched.map(l => l.id))
        const added = fetched.filter(l => !prevIdsRef.current.has(l.id) && prevIdsRef.current.size > 0).map(l => l.id)
        if (added.length > 0) {
          setNewIds(new Set(added))
          setTimeout(() => setNewIds(new Set()), 3000)
        }
        prevIdsRef.current = freshIds
      }
      setLogs(fetched)
      setTotal(data.total)
      setLastRefresh(new Date())
    }
    if (!silent) setLoading(false)
  }, [page, action, debouncedSearch, companyId])

  // Initial fetch + deps change
  useEffect(() => { fetchLogs() }, [fetchLogs])
  useEffect(() => { setPage(1) }, [action, debouncedSearch])

  // Live polling
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => fetchLogs(true), LIVE_INTERVAL)
    return () => clearInterval(id)
  }, [live, fetchLogs])

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
  }

  function parseMetadata(raw: string | null): string {
    if (!raw) return "—"
    try {
      const obj = JSON.parse(raw)
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(" · ")
    } catch { return raw }
  }

  function formatLastRefresh() {
    if (!lastRefresh) return ""
    const sec = Math.round((Date.now() - lastRefresh.getTime()) / 1000)
    if (sec < 5) return "à l'instant"
    return `il y a ${sec}s`
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {companyName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-sm">{companyName}</span>
            <span className="text-muted-foreground text-xs ml-2">— Logs d'audit</span>
          </div>
          <Badge variant="destructive" className="text-[10px]">SUPER ADMIN</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="p-8 max-w-6xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Toutes les actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {ALL_ACTIONS.map(a => (
                <SelectItem key={a} value={a}>{ACTION_LABELS[a].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Rechercher email, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {/* Live toggle */}
          <button
            onClick={() => setLive(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              live
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            {live ? "En direct" : "Pause"}
          </button>

          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Mis à jour {formatLastRefresh()}
            </span>
          )}

          <span className="text-sm text-muted-foreground ml-auto">
            {total} événement{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Page {page} / {totalPages || 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Date</TableHead>
                  <TableHead className="w-48">Action</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="w-32">IP</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      {loading ? "Chargement..." : "Aucun événement"}
                    </TableCell>
                  </TableRow>
                ) : logs.map(log => {
                  const def = ACTION_LABELS[log.action] ?? { label: log.action, variant: "outline" as const }
                  const isNew = newIds.has(log.id)
                  return (
                    <TableRow
                      key={log.id}
                      className={isNew ? "animate-pulse bg-emerald-500/5 transition-colors" : ""}
                    >
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={def.variant} className="text-[10px] whitespace-nowrap">
                          {def.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.userEmail ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.ip ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {parseMetadata(log.metadata)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
