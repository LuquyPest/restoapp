"use client"
import { useState } from "react"
import { ArrowLeft, Plus, Trash2, Copy, Check, Landmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/utils"
import { AUTHORITY_ROLES, AUTHORITY_ROLE_LABELS, type AuthorityRole } from "@/lib/authority"

interface AuthorityUser { id: string; email: string; name: string | null; role: AuthorityRole; authorityReadOnly: boolean; createdAt: string }
interface Props { users: AuthorityUser[] }

const EMPTY = { name: "", email: "", role: "IRS" as AuthorityRole, authorityReadOnly: false }

export default function AuthorityAccountsClient({ users: initial }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function refresh() {
    const res = await fetch("/api/admin/authorities")
    if (res.ok) setUsers(await res.json())
  }

  async function create() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/admin/authorities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setCreatedInfo({ email: data.email, password: data.password, name: data.name })
      setForm(EMPTY); setModal(false)
      await refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function remove() {
    if (!deleteId) return
    setLoading(true)
    await fetch(`/api/admin/authorities/${deleteId}`, { method: "DELETE" })
    setDeleteId(null); setLoading(false)
    await refresh()
  }

  async function toggleReadOnly(u: AuthorityUser) {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, authorityReadOnly: !u.authorityReadOnly } : x))
    const res = await fetch(`/api/admin/authorities/${u.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorityReadOnly: !u.authorityReadOnly }),
    })
    if (!res.ok) setUsers(prev => prev.map(x => x.id === u.id ? { ...x, authorityReadOnly: u.authorityReadOnly } : x))
  }

  function copyCredentials() {
    if (!createdInfo) return
    navigator.clipboard.writeText(`Nom : ${createdInfo.name}\nEmail : ${createdInfo.email}\nMot de passe : ${createdInfo.password}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 h-14 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <Landmark className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Comptes autorités</span>
        <Badge variant="destructive" className="text-[10px]">SUPER ADMIN</Badge>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Comptes ({users.length})</CardTitle>
            <Button onClick={() => { setForm(EMPTY); setError(""); setModal(true) }}>
              <Plus className="h-4 w-4" /> Créer un compte
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Lecture seule</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucun compte autorité</TableCell></TableRow>
                ) : users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{AUTHORITY_ROLE_LABELS[u.role]}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{u.email}</TableCell>
                    <TableCell><Switch checked={u.authorityReadOnly} onCheckedChange={() => toggleReadOnly(u)} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(u.id)}>
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

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Créer un compte autorité</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nom</Label><Input placeholder="Jean Dupont" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="agent@irs.gov" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as AuthorityRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUTHORITY_ROLES.map(r => <SelectItem key={r} value={r}>{AUTHORITY_ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Compte en lecture seule</p>
                <p className="text-xs text-muted-foreground">Consultation uniquement, ne peut ni envoyer de message ni poser de statut</p>
              </div>
              <Switch checked={form.authorityReadOnly} onCheckedChange={v => setForm({ ...form, authorityReadOnly: v })} />
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
              Le mot de passe est généré automatiquement et affiché une seule fois après création.
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading || !form.name || !form.email}>{loading ? "Création..." : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdInfo} onOpenChange={v => !v && setCreatedInfo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>✅ Compte créé</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-4 space-y-3">
              <div><p className="text-xs text-muted-foreground mb-0.5">Nom</p><p className="font-semibold">{createdInfo?.name}</p></div>
              <Separator />
              <div><p className="text-xs text-muted-foreground mb-0.5">Email de connexion</p><p className="font-mono text-sm font-semibold text-primary">{createdInfo?.email}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Mot de passe</p><p className="font-mono text-sm font-semibold">{createdInfo?.password}</p></div>
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

      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer ce compte ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">⚠️ Cette action est irréversible.</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={remove} disabled={loading}>{loading ? "Suppression..." : "Supprimer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
