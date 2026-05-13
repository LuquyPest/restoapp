"use client"
import { useState } from "react"
import { Plus, Truck, Mail, Phone, FileText, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Supplier { id: string; name: string; contact: string | null; email: string | null; phone: string | null; address: string | null; _count: { invoices: number } }
const EMPTY = { name: "", contact: "", email: "", phone: "", address: "" }
const FIELD_LABELS: Record<string, string> = { name: "Nom", contact: "Contact", email: "Email", phone: "Téléphone", address: "Adresse" }

export default function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Supplier | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [deleteError, setDeleteError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  function openCreate() { setEditTarget(null); setForm(EMPTY); setModal(true) }
  function openEdit(s: Supplier) {
    setEditTarget(s)
    setForm({ name: s.name, contact: s.contact ?? "", email: s.email ?? "", phone: s.phone ?? "", address: s.address ?? "" })
    setModal(true)
  }

  async function save() {
    setLoading(true)
    if (editTarget) {
      await fetch(`/api/suppliers/${editTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    setLoading(false); setModal(false); setForm(EMPTY); setEditTarget(null); router.refresh()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true); setDeleteError("")
    const res = await fetch(`/api/suppliers/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? "Erreur lors de la suppression")
      setDeleteLoading(false)
      return
    }
    setDeleteLoading(false); setDeleteTarget(null); router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map(s => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0"><Truck className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.name}</p>
                  {s.contact && <p className="text-xs text-muted-foreground">{s.contact}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteTarget(s); setDeleteError("") }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {(s.email || s.phone) && (
                <div className="space-y-1">
                  {s.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{s.email}</div>}
                  {s.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{s.phone}</div>}
                </div>
              )}
              <Link href="/invoices" className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                <FileText className="h-3 w-3" />{s._count.invoices} facture{s._count.invoices > 1 ? "s" : ""}
              </Link>
            </CardContent>
          </Card>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun fournisseur</p>
            <Button onClick={openCreate}>Ajouter le premier fournisseur</Button>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(["name", "contact", "email", "phone", "address"] as const).map(field => (
              <div key={field} className="space-y-1.5">
                <Label>{FIELD_LABELS[field]}</Label>
                <Input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={field === "name"} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={save} disabled={loading || !form.name.trim()}>
                {loading ? "Enregistrement..." : editTarget ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer le fournisseur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Supprimer <span className="font-semibold text-foreground">{deleteTarget?.name}</span> ? Cette action est irréversible.
            </p>
            {deleteError && <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">{deleteError}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
