"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Warning { id: string; title: string; description: string; occurredAt: string }
interface Props { employeeId: string; canManage: boolean; isOwner: boolean }

const EMPTY = { title: "", description: "", occurredAt: "" }

export default function EmployeeWarningsTab({ employeeId, canManage, isOwner }: Props) {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [loaded, setLoaded] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteWarning, setDeleteWarning] = useState<Warning | null>(null)

  const fetchWarnings = useCallback(async () => {
    const res = await fetch(`/api/employees/${employeeId}/warnings`)
    if (res.ok) setWarnings(await res.json())
    setLoaded(true)
  }, [employeeId])

  useEffect(() => { fetchWarnings() }, [fetchWarnings])

  async function create() {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${employeeId}/warnings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, occurredAt: form.occurredAt || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setModal(false); setForm(EMPTY); fetchWarnings()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function remove() {
    if (!deleteWarning) return
    setLoading(true)
    await fetch(`/api/employees/${employeeId}/warnings/${deleteWarning.id}`, { method: "DELETE" })
    setDeleteWarning(null); setLoading(false)
    fetchWarnings()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{warnings.length} avertissement{warnings.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button size="sm" onClick={() => { setForm(EMPTY); setError(""); setModal(true) }}>
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
        )}
      </div>

      {loaded && warnings.length === 0 && (
        <Card className="p-10 text-center"><p className="text-muted-foreground">Aucun avertissement</p></Card>
      )}

      <div className="space-y-2">
        {warnings.map(w => (
          <Card key={w.id} className="border-amber-500/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{w.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(w.occurredAt)}</p>
                <p className="text-sm mt-1.5 whitespace-pre-wrap">{w.description}</p>
              </div>
              {isOwner && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteWarning(w)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Ajouter un avertissement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Titre</Label><Input placeholder="Retard répété, manquement..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.occurredAt} onChange={e => setForm({ ...form, occurredAt: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-400">Cet avertissement sera visible par l'employé concerné.</div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button><Button className="flex-1" onClick={create} disabled={loading || !form.title || !form.description}>{loading ? "..." : "Ajouter"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteWarning} onOpenChange={v => !v && setDeleteWarning(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer cet avertissement ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteWarning(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={remove} disabled={loading}>{loading ? "..." : "Supprimer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
