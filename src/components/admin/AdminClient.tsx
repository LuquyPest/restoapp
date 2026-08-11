"use client"
import { useState } from "react"
import { Plus, Trash2, LogOut, Store, Users, ShoppingBag, Copy, Check, ClipboardList, Pencil, X, Landmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { COMPANY_TYPES, COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/business-types"

interface TaxBracket { min: number; max?: number; rate: number }
interface CompanyUser { email: string; name: string | null }
interface Company {
  id: string; name: string; type: CompanyType; mairieZone: "NORD" | "SUD" | null; currency: string; taxType: string; taxBrackets: string | null; createdAt: Date
  _count: { employees: number; orders: number }
  users: CompanyUser[]
}

const MAIRIE_LABELS: Record<"NORD" | "SUD", string> = { NORD: "Mairie Nord", SUD: "Mairie Sud" }

function CompanyTypeSelector({ value, onChange }: { value: CompanyType; onChange: (v: CompanyType) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Type d'entreprise</Label>
      <Select value={value} onValueChange={v => onChange(v as CompanyType)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {COMPANY_TYPES.map(t => <SelectItem key={t} value={t}>{COMPANY_TYPE_LABELS[t]}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 20)
}
function slugifyOwner(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")
}

const TAX_TYPES = [
  { value: "TYPE1", label: "Type 1", desc: "$1–$1 000 000 : 35% · Au-delà : 45%" },
  { value: "TYPE2", label: "Type 2", desc: "$0–$100 000 : 0% · $100 001–$1 000 000 : 30% · Au-delà : 40%" },
  { value: "TYPE3", label: "Type 3 (défaut)", desc: "$0–$50 000 : 0% · $50 001–$100 000 : 20% · $100 001–$500 000 : 30% · Au-delà : 40%" },
  { value: "CUSTOM", label: "Personnalisé", desc: "Tranches d'imposition personnalisées" },
]

const EMPTY_BRACKET: TaxBracket = { min: 0, rate: 0 }

function TaxTypeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Type d'imposition</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {TAX_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{TAX_TYPES.find(t => t.value === value)?.desc}</p>
    </div>
  )
}

function BracketsEditor({ brackets, onChange }: { brackets: TaxBracket[]; onChange: (b: TaxBracket[]) => void }) {
  function add() { onChange([...brackets, { min: brackets.at(-1)?.max ?? 0, rate: 0 }]) }
  function remove(i: number) { onChange(brackets.filter((_, idx) => idx !== i)) }
  function update(i: number, field: keyof TaxBracket, val: string) {
    const n = parseFloat(val)
    onChange(brackets.map((b, idx) => idx === i ? { ...b, [field]: isNaN(n) ? undefined : n } : b))
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tranches personnalisées</p>
      {brackets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Min ($)</p>
              <Input type="number" min="0" className="h-8 text-xs" value={b.min} onChange={e => update(i, "min", e.target.value)} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Max ($) — vide = illimité</p>
              <Input type="number" min="0" className="h-8 text-xs" value={b.max ?? ""} onChange={e => update(i, "max", e.target.value)} placeholder="∞" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Taux (%)</p>
              <Input type="number" min="0" max="100" step="0.1" className="h-8 text-xs" value={b.rate} onChange={e => update(i, "rate", e.target.value)} />
            </div>
          </div>
          <button onClick={() => remove(i)} className="mt-4 text-muted-foreground hover:text-destructive transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full h-8 text-xs">
        <Plus className="h-3 w-3" /> Ajouter une tranche
      </Button>
    </div>
  )
}

export default function AdminClient({ companies: initial }: { companies: Company[] }) {
  const router = useRouter()
  const [companies, setCompanies] = useState(initial)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string; company: string } | null>(null)
  const [copied, setCopied] = useState(false)


  const [form, setForm] = useState<{ name: string; ownerName: string; type: CompanyType; currency: string; taxType: string }>({ name: "", ownerName: "", type: "RESTO_BAR", currency: "$", taxType: "TYPE3" })
  const [createBrackets, setCreateBrackets] = useState<TaxBracket[]>([])

  const [editForm, setEditForm] = useState({ taxType: "TYPE3", taxBrackets: [] as TaxBracket[] })

  const previewEmail = form.ownerName && form.name
    ? `${slugifyOwner(form.ownerName)}@${slugify(form.name)}.com`
    : ""

  function openEdit(r: Company) {
    setEditId(r.id)
    let brackets: TaxBracket[] = []
    if (r.taxBrackets) { try { brackets = JSON.parse(r.taxBrackets) } catch {} }
    setEditForm({ taxType: r.taxType ?? "TYPE3", taxBrackets: brackets })
  }

  async function create() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          taxBrackets: form.taxType === "CUSTOM" ? createBrackets : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setCreatedInfo({ email: data.email, password: data.password, company: data.company.name })
      setForm({ name: "", ownerName: "", type: "RESTO_BAR", currency: "$", taxType: "TYPE3" })
      setCreateBrackets([])
      setModal(false)
      const listRes = await fetch("/api/admin/companies")
      if (listRes.ok) setCompanies(await listRes.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function saveEdit() {
    if (!editId) return
    setLoading(true)
    await fetch(`/api/admin/companies/${editId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxType: editForm.taxType,
        taxBrackets: editForm.taxType === "CUSTOM" ? editForm.taxBrackets : null,
      }),
    })
    setEditId(null); setLoading(false)
    const listRes = await fetch("/api/admin/companies")
    if (listRes.ok) setCompanies(await listRes.json())
  }

  async function updateMairie(id: string, mairieZone: "NORD" | "SUD" | null) {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, mairieZone } : c))
    await fetch(`/api/admin/companies/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mairieZone }),
    })
  }

  async function deleteCompany() {
    if (!deleteId) return
    setLoading(true)
    await fetch(`/api/admin/companies/${deleteId}`, { method: "DELETE" })
    setDeleteId(null); setLoading(false)
    const listRes = await fetch("/api/admin/companies")
    if (listRes.ok) setCompanies(await listRes.json())
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  function copyCredentials() {
    if (!createdInfo) return
    navigator.clipboard.writeText(`Établissement : ${createdInfo.company}\nEmail : ${createdInfo.email}\nMot de passe : ${createdInfo.password}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function taxLabel(t: string) { return TAX_TYPES.find(x => x.value === t)?.label ?? t }

  return (
    <div className="min-h-screen bg-background">
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/authorities")}>
            <Landmark className="h-4 w-4" /> Autorités
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/logs")}>
            <ClipboardList className="h-4 w-4" /> Logs
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Établissements</p>
            <p className="text-3xl font-bold text-primary">{companies.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Employés total</p>
            <p className="text-3xl font-bold">{companies.reduce((s, r) => s + r._count.employees, 0)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Commandes total</p>
            <p className="text-3xl font-bold">{companies.reduce((s, r) => s + r._count.orders, 0)}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Établissements ({companies.length})</CardTitle>
            <Button onClick={() => { setModal(true); setError("") }}>
              <Plus className="h-4 w-4" /> Créer un établissement
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mairie</TableHead>
                  <TableHead>Patron</TableHead>
                  <TableHead>Imposition</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Aucun établissement</TableCell></TableRow>
                ) : companies.map(r => (
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
                      <Badge variant="secondary" className="text-[10px]">{COMPANY_TYPE_LABELS[r.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={r.mairieZone ?? "none"} onValueChange={v => updateMairie(r.id, v === "none" ? null : v as "NORD" | "SUD")}>
                        <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          <SelectItem value="NORD">Mairie Nord</SelectItem>
                          <SelectItem value="SUD">Mairie Sud</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Badge variant="outline" className="text-[10px] font-mono">{taxLabel(r.taxType ?? "TYPE3")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />{r._count.employees}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />{r._count.orders}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(r)} title="Modifier l'imposition">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => router.push(`/admin/logs/${r.id}`)} title="Voir les logs">
                          <ClipboardList className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Créer un établissement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom de l'établissement</Label>
              <Input placeholder="Coffee Noir, Bella Vista..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nom du patron</Label>
              <Input placeholder="Vittoria Fonelli" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
            </div>
            <CompanyTypeSelector value={form.type} onChange={v => setForm({ ...form, type: v })} />
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
              Le mot de passe est généré automatiquement et affiché une seule fois après création.
            </div>
            <div className="space-y-1.5">
              <Label>Devise</Label>
              <Input className="w-24" maxLength={5} placeholder="$" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
            </div>
            <TaxTypeSelector value={form.taxType} onChange={v => { setForm({ ...form, taxType: v }); if (v !== "CUSTOM") setCreateBrackets([]) }} />
            {form.taxType === "CUSTOM" && <BracketsEditor brackets={createBrackets} onChange={setCreateBrackets} />}

            {previewEmail && (
              <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Email de connexion généré</p>
                <p className="text-sm font-mono font-semibold text-primary">{previewEmail}</p>
              </div>
            )}
            {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading || !form.name || !form.ownerName}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit tax type modal */}
      <Dialog open={!!editId} onOpenChange={v => !v && setEditId(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier l'imposition</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <TaxTypeSelector value={editForm.taxType} onChange={v => { setEditForm({ ...editForm, taxType: v }); if (v !== "CUSTOM") setEditForm(prev => ({ ...prev, taxType: v, taxBrackets: [] })) }} />
            {editForm.taxType === "CUSTOM" && <BracketsEditor brackets={editForm.taxBrackets} onChange={b => setEditForm({ ...editForm, taxBrackets: b })} />}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditId(null)}>Annuler</Button>
              <Button className="flex-1" onClick={saveEdit} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials display after creation */}
      <Dialog open={!!createdInfo} onOpenChange={v => !v && setCreatedInfo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>✅ Établissement créé</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Établissement</p>
                <p className="font-semibold">{createdInfo?.company}</p>
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
          <DialogHeader><DialogTitle>Supprimer cet établissement ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              ⚠️ Cette action est irréversible. Toutes les données seront définitivement supprimées.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={deleteCompany} disabled={loading}>
                {loading ? "Suppression..." : "Supprimer définitivement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
