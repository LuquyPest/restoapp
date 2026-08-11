"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Check, X, Trash2, CalendarDays } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Leave {
  id: string; type: "PAID" | "UNPAID" | "SICK" | "OTHER"
  startDate: string; endDate: string; daysCount: number
  reason: string | null; status: "PENDING" | "APPROVED" | "REJECTED"
  decisionNote: string | null
}
interface Props { employeeId: string; canManage: boolean; paidLeaveBalance: number | null }

const TYPE_LABELS: Record<Leave["type"], string> = { PAID: "Congé payé", UNPAID: "Sans solde", SICK: "Maladie", OTHER: "Autre" }
const STATUS_VARIANT: Record<Leave["status"], "default" | "destructive" | "outline"> = { PENDING: "outline", APPROVED: "default", REJECTED: "destructive" }
const STATUS_LABELS: Record<Leave["status"], string> = { PENDING: "En attente", APPROVED: "Approuvé", REJECTED: "Refusé" }

const EMPTY = { type: "PAID" as Leave["type"], startDate: "", endDate: "", reason: "" }

export default function EmployeeLeavesTab({ employeeId, canManage, paidLeaveBalance }: Props) {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loaded, setLoaded] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteLeave, setDeleteLeave] = useState<Leave | null>(null)

  const fetchLeaves = useCallback(async () => {
    const res = await fetch(`/api/employees/${employeeId}/leaves`)
    if (res.ok) setLeaves(await res.json())
    setLoaded(true)
  }, [employeeId])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  async function create() {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${employeeId}/leaves`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setModal(false); setForm(EMPTY); fetchLeaves()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function decide(leave: Leave, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/employees/${employeeId}/leaves/${leave.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchLeaves()
  }

  async function remove() {
    if (!deleteLeave) return
    setLoading(true)
    await fetch(`/api/employees/${employeeId}/leaves/${deleteLeave.id}`, { method: "DELETE" })
    setDeleteLeave(null); setLoading(false)
    fetchLeaves()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {paidLeaveBalance !== null ? <span>Solde congés payés : <strong>{paidLeaveBalance} j</strong></span> : <span className="text-muted-foreground">Suivi du solde non activé</span>}
        </div>
        <Button size="sm" onClick={() => { setForm(EMPTY); setError(""); setModal(true) }}>
          <Plus className="h-3.5 w-3.5" /> {canManage ? "Ajouter" : "Demander un congé"}
        </Button>
      </div>

      {loaded && leaves.length === 0 && (
        <Card className="p-10 text-center"><p className="text-muted-foreground">Aucun congé enregistré</p></Card>
      )}

      <div className="space-y-2">
        {leaves.map(leave => (
          <Card key={leave.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{TYPE_LABELS[leave.type]}</span>
                  <Badge variant={STATUS_VARIANT[leave.status]} className="text-[10px]">{STATUS_LABELS[leave.status]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(leave.startDate)} → {formatDate(leave.endDate)} · {leave.daysCount} j
                </p>
                {leave.reason && <p className="text-xs text-muted-foreground mt-1">{leave.reason}</p>}
              </div>
              {canManage && leave.status === "PENDING" && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-600" onClick={() => decide(leave, "APPROVED")}><Check className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => decide(leave, "REJECTED")}><X className="h-3.5 w-3.5" /></Button>
                </div>
              )}
              {(canManage || leave.status === "PENDING") && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteLeave(leave)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{canManage ? "Ajouter un congé" : "Demander un congé"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as Leave["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(TYPE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Début</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Fin</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Motif (optionnel)</Label><Textarea rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button><Button className="flex-1" onClick={create} disabled={loading || !form.startDate || !form.endDate}>{loading ? "..." : "Valider"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteLeave} onOpenChange={v => !v && setDeleteLeave(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Annuler ce congé ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteLeave(null)}>Retour</Button>
              <Button variant="destructive" className="flex-1" onClick={remove} disabled={loading}>{loading ? "..." : "Confirmer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
