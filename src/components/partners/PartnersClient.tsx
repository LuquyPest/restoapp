"use client"
import { useState } from "react"
import { Plus, Pencil, Handshake } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface Partner { id: string; name: string; discountPercent: number; isActive: boolean }
const EMPTY = { name: "", discountPercent: "" }

export default function PartnersClient({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Partner | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    const payload = { name: form.name, discountPercent: parseFloat(form.discountPercent) }
    if (modal === "create") await fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/partners/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function toggle(p: Partner) {
    await fetch(`/api/partners/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) })
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partenaires</h1>
          <p className="text-sm text-muted-foreground mt-1">{partners.filter(p => p.isActive).length} actif{partners.filter(p=>p.isActive).length>1?"s":""}</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setModal("create") }}><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map(p => (
          <Card key={p.id} className={p.isActive ? "" : "opacity-60"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0"><Handshake className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">−{p.discountPercent}% de remise</p>
                </div>
                <Badge variant={p.isActive ? "success" : "secondary"}>{p.isActive ? "Actif" : "Inactif"}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Switch checked={p.isActive} onCheckedChange={() => toggle(p)} />
                  <span className="text-xs text-muted-foreground">{p.isActive ? "Actif" : "Inactif"}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(p); setForm({ name: p.name, discountPercent: String(p.discountPercent) }); setModal("edit") }}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {partners.length === 0 && (
          <div className="col-span-full rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun partenaire</p>
            <Button onClick={() => setModal("create")}>Ajouter le premier partenaire</Button>
          </div>
        )}
      </div>

      <Dialog open={modal !== null} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{modal === "create" ? "Nouveau partenaire" : "Modifier"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input placeholder="Mairie, Hôpital..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Réduction (%)</Label><Input type="number" min="0" max="100" step="0.1" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button className="flex-1" onClick={save} disabled={loading}>{loading ? "..." : "Enregistrer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
