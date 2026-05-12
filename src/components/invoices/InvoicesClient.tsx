"use client"
import { useState } from "react"
import { Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Supplier { id: string; name: string }
interface Invoice { id: string; reference: string | null; amount: number; dueDate: Date; status: string; note: string | null; supplier: Supplier; createdAt: Date }
const EMPTY = { supplierId: "", reference: "", amount: "", dueDate: "", note: "" }

export default function InvoicesClient({ invoices, suppliers, currency }: { invoices: Invoice[]; suppliers: Supplier[]; currency: string }) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalPending = invoices.filter(i => i.status !== "PAID").reduce((s, i) => s + i.amount, 0)

  async function create() {
    setLoading(true)
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) })
    setLoading(false); setModal(false); setForm(EMPTY); router.refresh()
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) })
    router.refresh()
  }

  const StatusBadge = ({ s }: { s: string }) => {
    if (s === "PAID") return <Badge variant="success"><CheckCircle className="h-3 w-3" /> Payée</Badge>
    if (s === "OVERDUE") return <Badge variant="destructive"><AlertTriangle className="h-3 w-3" /> En retard</Badge>
    return <Badge variant="warning"><Clock className="h-3 w-3" /> En attente</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground mt-1">{invoices.filter(i => i.status !== "PAID").length} en attente · {fmt(totalPending)} dû</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Nouvelle facture</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead><TableHead>Référence</TableHead><TableHead>Montant</TableHead><TableHead>Échéance</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucune facture</TableCell></TableRow>
            ) : invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">{inv.reference ?? "—"}</TableCell>
                <TableCell className="font-semibold">{fmt(inv.amount)}</TableCell>
                <TableCell className={inv.status === "OVERDUE" ? "text-destructive font-medium" : "text-muted-foreground"}>{formatDate(inv.dueDate)}</TableCell>
                <TableCell><StatusBadge s={inv.status} /></TableCell>
                <TableCell>{inv.status !== "PAID" && <Button variant="ghost" size="sm" className="h-7 text-xs hover:text-primary" onClick={() => markPaid(inv.id)}>Marquer payée</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Fournisseur</Label>
              <Select value={form.supplierId} onValueChange={v => setForm({ ...form, supplierId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Référence</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Montant</Label><Input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Échéance</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Note</Label><Textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading || !form.supplierId || !form.amount}>{loading ? "Création..." : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
