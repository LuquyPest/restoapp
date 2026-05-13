"use client"
import { useState } from "react"
import { Plus, Trash2, LogOut, Store, Users, ShoppingBag, Copy, Check, Eye, EyeOff, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"

interface RestaurantUser { email: string; name: string | null }
interface Restaurant {
  id: string; name: string; currency: string; createdAt: Date
  _count: { employees: number; orders: number }
  users: RestaurantUser[]
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 20)
}

function slugifyOwner(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")
}

export default function AdminClient({ restaurants: initial }: { restaurants: Restaurant[] }) {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState(initial)
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string; restaurant: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({ name: "", ownerName: "", ownerPassword: "", currency: "$" })

  const previewEmail = form.ownerName && form.name
    ? `${slugifyOwner(form.ownerName)}@${slugify(form.name)}.com`
    : ""

  async function create() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setCreatedInfo({ email: data.email, password: form.ownerPassword, restaurant: data.restaurant.name })
      setForm({ name: "", ownerName: "", ownerPassword: "", currency: "$" })
      setModal(false)
      router.refresh()
      // Refresh list
      const listRes = await fetch("/api/admin/restaurants")
      if (listRes.ok) setRestaurants(await listRes.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function deleteRestaurant() {
    if (!deleteId) return
    setLoading(true)
    await fetch(`/api/admin/restaurants/${deleteId}`, { method: "DELETE" })
    setDeleteId(null); setLoading(false)
    const listRes = await fetch("/api/admin/restaurants")
    if (listRes.ok) setRestaurants(await listRes.json())
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  function copyCredentials() {
    if (!createdInfo) return
    navigator.clipboard.writeText(`Restaurant : ${createdInfo.restaurant}\nEmail : ${createdInfo.email}\nMot de passe : ${createdInfo.password}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Administration RestoManager</span>
          <Badge variant="destructive" className="text-[10px]">SUPER ADMIN</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/logs")}>
            <ClipboardList className="h-4 w-4" /> Logs
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Restaurants</p>
            <p className="text-3xl font-bold text-primary">{restaurants.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Employés total</p>
            <p className="text-3xl font-bold">{restaurants.reduce((s, r) => s + r._count.employees, 0)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Commandes total</p>
            <p className="text-3xl font-bold">{restaurants.reduce((s, r) => s + r._count.orders, 0)}</p>
          </CardContent></Card>
        </div>

        {/* Restaurants list */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Restaurants ({restaurants.length})</CardTitle>
            <Button onClick={() => { setModal(true); setError("") }}>
              <Plus className="h-4 w-4" /> Créer un restaurant
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Patron (email de connexion)</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucun restaurant</TableCell></TableRow>
                ) : restaurants.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Store className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.currency}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.users[0] ? (
                        <div>
                          <p className="text-sm font-medium">{r.users[0].name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{r.users[0].email}</p>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {r._count.employees}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                        {r._count.orders}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Create modal */}
      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Créer un restaurant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom du restaurant</Label>
              <Input placeholder="Coffee Noir, Bella Vista..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nom du patron</Label>
              <Input placeholder="Vittoria Fonelli" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mot de passe du patron</Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  className="pr-10"
                  placeholder="Min. 6 caractères"
                  value={form.ownerPassword}
                  onChange={e => setForm({ ...form, ownerPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Devise</Label>
              <Input className="w-24" maxLength={5} placeholder="$" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
            </div>

            {previewEmail && (
              <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Email de connexion généré</p>
                <p className="text-sm font-mono font-semibold text-primary">{previewEmail}</p>
                <p className="text-xs text-muted-foreground">Format : prenom.nom@nomresto.com</p>
              </div>
            )}

            {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading || !form.name || !form.ownerName || form.ownerPassword.length < 6}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials display after creation */}
      <Dialog open={!!createdInfo} onOpenChange={v => !v && setCreatedInfo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>✅ Restaurant créé</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Restaurant</p>
                <p className="font-semibold">{createdInfo?.restaurant}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email de connexion</p>
                <p className="font-mono text-sm font-semibold text-primary">{createdInfo?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Mot de passe</p>
                <p className="font-mono text-sm font-semibold">{createdInfo?.password}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Notez bien ces identifiants, ils ne seront plus affichés.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyCredentials}>
                {copied ? <><Check className="h-4 w-4" /> Copié</> : <><Copy className="h-4 w-4" /> Copier</>}
              </Button>
              <Button className="flex-1" onClick={() => setCreatedInfo(null)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer ce restaurant ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              ⚠️ Cette action est irréversible. Toutes les données (employés, commandes, ventes) seront définitivement supprimées.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={deleteRestaurant} disabled={loading}>
                {loading ? "Suppression..." : "Supprimer définitivement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
