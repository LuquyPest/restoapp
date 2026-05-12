"use client"
import { useState } from "react"
import { Plus, Truck, Mail, Phone, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Supplier { id: string; name: string; contact: string | null; email: string | null; phone: string | null; address: string | null; _count: { invoices: number } }
const EMPTY = { name: "", contact: "", email: "", phone: "", address: "" }

export default function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setLoading(false); setModal(false); setForm(EMPTY); router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Ajouter</Button>
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
            <Button onClick={() => setModal(true)}>Ajouter le premier fournisseur</Button>
          </div>
        )}
      </div>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouveau fournisseur</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(["name", "contact", "email", "phone", "address"] as const).map(field => (
              <div key={field} className="space-y-1.5">
                <Label className="capitalize">{field === "address" ? "Adresse" : field === "contact" ? "Contact" : field}</Label>
                <Input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={field === "name"} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading}>{loading ? "Création..." : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
