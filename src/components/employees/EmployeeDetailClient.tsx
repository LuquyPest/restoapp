"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, CreditCard, Phone, Mail, Key, UserCheck, UserX, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import EmployeeMessagesTab from "./EmployeeMessagesTab"
import EmployeeDocumentsTab from "./EmployeeDocumentsTab"
import EmployeeLeavesTab from "./EmployeeLeavesTab"
import EmployeeWarningsTab from "./EmployeeWarningsTab"
import EmployeeTimelineTab from "./EmployeeTimelineTab"

interface Grade { id: string; name: string; salaryPercent: number; dividendPercent: number }
interface Employee {
  id: string; firstName: string; lastName: string; phone: string | null
  accountNumber: string | null; isActive: boolean; hiredAt: Date; paidLeaveBalance: number | null
  grade: Grade; user: { id: string; email: string }
}
interface EventItem { id: string; type: string; title: string; description: string | null; createdAt: string }
interface Props { employee: Employee; grades: Grade[]; canManage: boolean; isOwner: boolean; viewerUserId: string; events?: EventItem[] }

const TABS = [
  { key: "info", label: "Informations" },
  { key: "messages", label: "Messages" },
  { key: "documents", label: "Documents" },
  { key: "leaves", label: "Congés" },
  { key: "warnings", label: "Avertissements" },
  { key: "timeline", label: "Historique" },
] as const
type TabKey = typeof TABS[number]["key"]

export default function EmployeeDetailClient({ employee, grades, canManage, isOwner, viewerUserId, events = [] }: Props) {
  const router = useRouter()
  const visibleTabs = canManage ? TABS : TABS.filter(t => t.key !== "timeline")
  const [tab, setTab] = useState<TabKey>("info")
  const [editForm, setEditForm] = useState({ gradeId: employee.grade.id, phone: employee.phone ?? "", accountNumber: employee.accountNumber ?? "", paidLeaveBalance: employee.paidLeaveBalance !== null ? String(employee.paidLeaveBalance) : "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [resetModal, setResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  async function saveInfo() {
    setLoading(true); setError(""); setSaved(false)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: editForm.gradeId, phone: editForm.phone, accountNumber: editForm.accountNumber,
          paidLeaveBalance: editForm.paidLeaveBalance === "" ? null : parseFloat(editForm.paidLeaveBalance),
        }),
      })
      if (!res.ok) throw new Error("Erreur")
      setSaved(true); setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function toggleActive() {
    await fetch(`/api/employees/${employee.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !employee.isActive }) })
    router.refresh()
  }

  async function resetPassword() {
    if (newPassword.length < 6) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${employee.id}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: newPassword }) })
      if (!res.ok) throw new Error("Erreur")
      setResetModal(false); setNewPassword("")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/employees"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{employee.firstName} {employee.lastName}</h1>
          <p className="text-sm text-muted-foreground truncate">{employee.user.email}</p>
        </div>
        {canManage && (
          <Button variant="outline" size="sm" onClick={toggleActive}>
            {employee.isActive ? <><UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Actif</> : <><UserX className="h-3.5 w-3.5 text-destructive" /> Inactif</>}
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {visibleTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Détails</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{employee.user.email}</div>
                {employee.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{employee.phone}</div>}
                {employee.accountNumber && <div className="flex items-center gap-2 text-sm font-mono"><CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{employee.accountNumber}</div>}
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />Recruté le {formatDate(employee.hiredAt)}</div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default" className="gap-1 text-[11px]"><Award className="h-3 w-3" />{employee.grade.name}</Badge>
                <Badge variant="secondary" className="text-[11px]">{employee.grade.salaryPercent}% salaire</Badge>
                {!employee.isActive && <Badge variant="destructive" className="text-[11px]">Inactif</Badge>}
              </div>
              {canManage && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setResetModal(true); setNewPassword(""); setError("") }}>
                  <Key className="h-3.5 w-3.5" /> Réinitialiser le mot de passe
                </Button>
              )}
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Modifier</p>
                <div className="space-y-1.5">
                  <Label>Grade</Label>
                  <Select value={editForm.gradeId} onValueChange={v => setEditForm({ ...editForm, gradeId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name} — {g.salaryPercent}%</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Téléphone</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>N° compte bancaire</Label><Input value={editForm.accountNumber} onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Solde congés payés (jours)</Label><Input type="number" min="0" step="0.5" placeholder="Non suivi" value={editForm.paidLeaveBalance} onChange={e => setEditForm({ ...editForm, paidLeaveBalance: e.target.value })} /></div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {saved && <p className="text-sm text-emerald-500">✓ Enregistré</p>}
                <Button className="w-full" onClick={saveInfo} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "messages" && (
        <EmployeeMessagesTab employeeId={employee.id} viewerUserId={viewerUserId} />
      )}

      {tab === "documents" && (
        <EmployeeDocumentsTab employeeId={employee.id} canManage={canManage} />
      )}

      {tab === "leaves" && (
        <EmployeeLeavesTab employeeId={employee.id} canManage={canManage} paidLeaveBalance={employee.paidLeaveBalance} />
      )}

      {tab === "warnings" && (
        <EmployeeWarningsTab employeeId={employee.id} canManage={canManage} isOwner={isOwner} />
      )}

      {tab === "timeline" && canManage && (
        <EmployeeTimelineTab events={events} />
      )}

      <Dialog open={resetModal} onOpenChange={v => !v && setResetModal(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Réinitialiser le mot de passe</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-500">Le mot de passe sera changé immédiatement.</div>
            <div className="space-y-1.5"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="Min. 6 caractères" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setResetModal(false)}>Annuler</Button><Button className="flex-1" onClick={resetPassword} disabled={loading || newPassword.length < 6}>{loading ? "..." : "Changer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
