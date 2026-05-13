"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Globe, Calendar } from "lucide-react"
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
import { ChevronLeft, ChevronRight } from "lucide-react"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

interface Charge { id: string; name: string; amount: number; type: string; isActive: boolean; weekNumber: number | null; year: number | null }
const EMPTY = { name: "", amount: "", type: "DEDUCTIBLE", scope: "global" }

export default function ChargesClient({ currency }: { currency: string }) {
  const router = useRouter()
  const now = new Date()
  const [week, setWeek] = useState(getISOWeek(now))
  const [year, setYear] = useState(now.getFullYear())
  const [charges, setCharges] = useState<Charge[]>([])
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Charge | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const fmt = (n: number) => formatCurrency(n, currency)

  const fetchCharges = useCallback(async () => {
    const res = await fetch(`/api/charges?week=${week}&year=${year}`)
    if (res.ok) setCharges(await res.json())
  }, [week, year])

  useEffect(() => { fetchCharges() }, [fetchCharges])

  const totalDeductible = charges.filter(c => c.isActive && c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const totalNonDeductible = charges.filter(c => c.isActive && c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)

  function prevWeek() { if (week === 1) { setWeek(52); setYear(y => y-1) } else setWeek(w => w-1) }
  function nextWeek() { if (week === 52) { setWeek(1); setYear(y => y+1) } else setWeek(w => w+1) }

  async function save() {
    setLoading(true)
    const payload: any = {
      name: form.name,
      amount: parseFloat(form.amount),
      type: form.type,
      weekNumber: form.scope === "week" ? week : null,
      year: form.scope === "week" ? year : null,
    }
    if (modal === "create") {
      await fetch("/api/charges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    } else if (selected) {
      await fetch(`/api/charges/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, amount: parseFloat(form.amount), type: form.type }) })
    }
    setLoading(false); setModal(null); fetchCharges()
  }

  async function toggle(c: Charge) {
    await fetch(`/api/charges/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) })
    fetchCharges()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette charge ?")) return
    await fetch(`/api/charges/${id}`, { method: "DELETE" }); fetchCharges()
  }

  const isCurrentWeek = week === getISOWeek(now) && year === now.getFullYear()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Charges</h1>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span>Déductibles : <span className="font-semibold text-amber-500">{fmt(totalDeductible)}</span></span>
            <span>Non déductibles : <span className="font-semibold text-destructive">{fmt(totalNonDeductible)}</span></span>
          </div>
        </div>
        <Button onClick={() => { setForm(EMPTY); setModal("create") }}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {/* Week selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
          <span className="text-base font-bold">S{String(week).padStart(2,"0")} {year}</span>
          {isCurrentWeek && <Badge variant="default" className="text-[10px] px-1.5">En cours</Badge>}
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
        <span className="text-xs text-muted-foreground">Affiche les charges globales + celles de cette semaine</span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Portée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucune charge pour cette semaine</TableCell></TableRow>
            ) : charges.map(c => (
              <TableRow key={c.id} className={c.isActive ? "" : "opacity-50"}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-semibold">{fmt(c.amount)}</TableCell>
                <TableCell>
                  {c.type === "DEDUCTIBLE"
                    ? <Badge variant="warning">Déductible</Badge>
                    : <Badge variant="destructive">Non déductible</Badge>}
                </TableCell>
                <TableCell>
                  {c.weekNumber
                    ? <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" />S{String(c.weekNumber).padStart(2,"0")} {c.year}</Badge>
                    : <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" />Globale</Badge>}
                </TableCell>
                <TableCell>{c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(c)}>
                      {c.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setSelected(c)
                      setForm({ name: c.name, amount: String(c.amount), type: c.type, scope: c.weekNumber ? "week" : "global" })
                      setModal("edit")
                    }}>
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
            <div className="space-y-1.5"><Label>Nom</Label><Input placeholder="Loyer, Fournisseur..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Montant</Label><Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEDUCTIBLE">Déductible</SelectItem>
                  <SelectItem value="NON_DEDUCTIBLE">Non déductible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {modal === "create" && (
              <div className="space-y-1.5">
                <Label>Portée</Label>
                <Select value={form.scope} onValueChange={v => setForm({ ...form, scope: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Globale (toutes les semaines)</SelectItem>
                    <SelectItem value="week">Semaine S{String(week).padStart(2,"0")} {year} uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
