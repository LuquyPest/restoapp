"use client"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Charge { id: string; name: string; amount: number; type: string; isActive: boolean }
const EMPTY = { name: "", amount: "", type: "DEDUCTIBLE" }

export default function ChargesClient({ charges, currency }: { charges: Charge[]; currency: string }) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Charge | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const fmt = (n: number) => formatCurrency(n, currency)

  const totalDeductible = charges.filter(c => c.isActive && c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const totalNonDeductible = charges.filter(c => c.isActive && c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)

  async function save() {
    setLoading(true)
    const payload = { name: form.name, amount: parseFloat(form.amount), type: form.type }
    if (modal === "create") await fetch("/api/charges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/charges/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function toggle(c: Charge) {
    await fetch(`/api/charges/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette charge ?")) return
    await fetch(`/api/charges/${id}`, { method: "DELETE" }); router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Charges</h1>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span>Déductibles actives : <span className="font-semibold text-amber-500">{fmt(totalDeductible)}</span></span>
            <span>Non déductibles : <span className="font-semibold text-destructive">{fmt(totalNonDeductible)}</span></span>
          </div>
        </div>
        <Button onClick={() => { setForm(EMPTY); setModal("create") }}><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Aucune charge configurée</TableCell></TableRow>
            ) : charges.map(c => (
              <TableRow key={c.id} className={c.isActive ? "" : "opacity-50"}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-semibold">{fmt(c.amount)}</TableCell>
                <TableCell>
                  {c.type === "DEDUCTIBLE"
                    ? <Badge variant="warning">Déductible</Badge>
                    : <Badge variant="destructive">Non déductible</Badge>}
                </TableCell>
                <TableCell>{c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(c)}>
                      {c.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(c); setForm({ name: c.name, amount: String(c.amount), type: c.type }); setModal("edit") }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal !== null} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{modal === "create" ? "Nouvelle charge" : "Modifier la charge"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input placeholder="Loyer, Électricité, Fournisseur..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Montant</Label><Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEDUCTIBLE">Déductible (réduit le bénéfice brut)</SelectItem>
                  <SelectItem value="NON_DEDUCTIBLE">Non déductible (déduit en fin de bilan)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
