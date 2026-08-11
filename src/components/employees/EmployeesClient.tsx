"use client"
import { useState } from "react"
import { UserPlus, UserCheck, UserX, Pencil, Award, CreditCard, Trash2, Key, Phone, Settings, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Grade { id: string; name: string; salaryPercent: number; dividendPercent: number }
interface Employee {
  id: string; firstName: string; lastName: string; phone: string | null
  accountNumber: string | null; isActive: boolean; hiredAt: Date
  grade: Grade; user: { email: string; id: string }
}
interface Props { employees: Employee[]; grades: Grade[]; currency: string; companyId: string }

const EMPTY_EMP = { firstName: "", lastName: "", email: "", password: "", gradeId: "", phone: "", accountNumber: "" }
const EMPTY_GRADE = { name: "", salaryPercent: "", dividendPercent: "" }

export default function EmployeesClient({ employees, grades, companyId }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "grade" | "editGrade" | "editEmp" | "resetPwd" | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null)
  const [empForm, setEmpForm] = useState(EMPTY_EMP)
  const [gradeForm, setGradeForm] = useState(EMPTY_GRADE)
  const [editEmpForm, setEditEmpForm] = useState({ gradeId: "", phone: "", accountNumber: "" })
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteGradeId, setDeleteGradeId] = useState<string | null>(null)
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null)

  async function createEmployee() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(empForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setModal(null); setEmpForm(EMPTY_EMP); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function createGrade() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/employees/grades", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gradeForm.name, salaryPercent: parseFloat(gradeForm.salaryPercent), dividendPercent: parseFloat(gradeForm.dividendPercent || "0") }),
      })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); setGradeForm(EMPTY_GRADE); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function deleteGrade() {
    if (!deleteGradeId) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/grades/${deleteGradeId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setDeleteGradeId(null); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function updateGrade() {
    if (!selectedGrade) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/grades/${selectedGrade.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gradeForm.name, salaryPercent: parseFloat(gradeForm.salaryPercent), dividendPercent: parseFloat(gradeForm.dividendPercent || "0") }),
      })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function updateEmployee() {
    if (!selectedEmp) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${selectedEmp.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeId: editEmpForm.gradeId || undefined, phone: editEmpForm.phone, accountNumber: editEmpForm.accountNumber }),
      })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function resetPassword() {
    if (!selectedEmp || newPassword.length < 6) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${selectedEmp.id}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: newPassword }) })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); setNewPassword(""); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function deleteEmployee() {
    if (!empToDelete) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/${empToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erreur lors de la suppression")
        setEmpToDelete(null)
        return
      }
      setEmpToDelete(null)
      router.refresh()
    } catch {
      setError("Erreur réseau lors de la suppression")
      setEmpToDelete(null)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/employees/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) })
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employés</h1>
          <p className="text-sm text-muted-foreground mt-1">{employees.filter(e => e.isActive).length} actifs · {employees.length} au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setGradeForm(EMPTY_GRADE); setError(""); setModal("grade") }}><Award className="h-4 w-4" /> Nouveau grade</Button>
          <Button onClick={() => { setEmpForm(EMPTY_EMP); setError(""); setModal("create") }}><UserPlus className="h-4 w-4" /> Ajouter</Button>
        </div>
      </div>

      {/* Grades */}
      {grades.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Grades</p>
          <div className="flex gap-2 flex-wrap">
            {grades.map(g => (
              <div key={g.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{g.name}</span>
                <Badge variant="default" className="text-[10px]">{g.salaryPercent}% salaire</Badge>
                {g.dividendPercent > 0 && <Badge variant="secondary" className="text-[10px]">{g.dividendPercent}% dividende</Badge>}
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => { setSelectedGrade(g); setGradeForm({ name: g.name, salaryPercent: String(g.salaryPercent), dividendPercent: String(g.dividendPercent ?? 0) }); setError(""); setModal("editGrade") }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={() => { setError(""); setDeleteGradeId(g.id) }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Global error (e.g. delete failure) */}
      {error && !modal && !deleteGradeId && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Employees grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map(emp => (
          <Card key={emp.id} className={emp.isActive ? "" : "opacity-60"}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default" className="gap-1 text-[11px]"><Award className="h-3 w-3" />{emp.grade.name}</Badge>
                <Badge variant="secondary" className="text-[11px]">{emp.grade.salaryPercent}% salaire</Badge>
                {(emp.grade.dividendPercent ?? 0) > 0 && <Badge variant="outline" className="text-[11px]">{emp.grade.dividendPercent}% dividende</Badge>}
                {!emp.isActive && <Badge variant="destructive" className="text-[11px]">Inactif</Badge>}
              </div>
              {emp.accountNumber && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CreditCard className="h-3 w-3" /><span className="font-mono">{emp.accountNumber}</span></div>}
              {emp.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{emp.phone}</div>}
              <p className="text-[11px] text-muted-foreground">Recruté le {formatDate(emp.hiredAt)}</p>
              <Separator />
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => toggleActive(emp.id, emp.isActive)}>
                  {emp.isActive ? <><UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Actif</> : <><UserX className="h-3.5 w-3.5 text-destructive" /> Inactif</>}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedEmp(emp); setEditEmpForm({ gradeId: emp.grade.id, phone: emp.phone ?? "", accountNumber: emp.accountNumber ?? "" }); setError(""); setModal("editEmp") }}><Settings className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedEmp(emp); setNewPassword(""); setError(""); setModal("resetPwd") }}><Key className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => { setError(""); setEmpToDelete(emp) }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun employé</p>
            <Button onClick={() => setModal("create")}>Ajouter le premier employé</Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={modal === "create"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent><DialogHeader><DialogTitle>Ajouter un employé</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Prénom</Label><Input value={empForm.firstName} onChange={e => setEmpForm({ ...empForm, firstName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nom</Label><Input value={empForm.lastName} onChange={e => setEmpForm({ ...empForm, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Mot de passe</Label><Input type="password" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Téléphone</Label><Input value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>N° compte</Label><Input value={empForm.accountNumber} onChange={e => setEmpForm({ ...empForm, accountNumber: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Grade</Label>
              <Select value={empForm.gradeId} onValueChange={v => setEmpForm({ ...empForm, gradeId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un grade" /></SelectTrigger>
                <SelectContent>{grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name} — {g.salaryPercent}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button><Button className="flex-1" onClick={createEmployee} disabled={loading}>{loading ? "Création..." : "Créer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "editEmp"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Modifier — {selectedEmp?.firstName} {selectedEmp?.lastName}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Grade</Label>
              <Select value={editEmpForm.gradeId} onValueChange={v => setEditEmpForm({ ...editEmpForm, gradeId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name} — {g.salaryPercent}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Téléphone</Label><Input value={editEmpForm.phone} onChange={e => setEditEmpForm({ ...editEmpForm, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>N° compte bancaire</Label><Input value={editEmpForm.accountNumber} onChange={e => setEditEmpForm({ ...editEmpForm, accountNumber: e.target.value })} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button><Button className="flex-1" onClick={updateEmployee} disabled={loading}>{loading ? "..." : "Enregistrer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "resetPwd"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Réinitialiser le mot de passe</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-500">Le mot de passe sera changé immédiatement.</div>
            <div className="space-y-1.5"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="Min. 6 caractères" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button><Button className="flex-1" onClick={resetPassword} disabled={loading || newPassword.length < 6}>{loading ? "..." : "Changer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "grade"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nouveau grade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom du grade</Label><Input placeholder="Serveur, Manager..." value={gradeForm.name} onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>% Salaire (du CA net)</Label><Input type="number" min="0" max="100" step="0.1" value={gradeForm.salaryPercent} onChange={e => setGradeForm({ ...gradeForm, salaryPercent: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>% Dividende (du total)</Label><Input type="number" min="0" max="100" step="0.1" placeholder="0" value={gradeForm.dividendPercent} onChange={e => setGradeForm({ ...gradeForm, dividendPercent: e.target.value })} /></div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button><Button className="flex-1" onClick={createGrade} disabled={loading}>{loading ? "..." : "Créer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "editGrade"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Modifier le grade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input value={gradeForm.name} onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>% Salaire (du CA net)</Label><Input type="number" min="0" max="100" step="0.1" value={gradeForm.salaryPercent} onChange={e => setGradeForm({ ...gradeForm, salaryPercent: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>% Dividende (du total)</Label><Input type="number" min="0" max="100" step="0.1" placeholder="0" value={gradeForm.dividendPercent} onChange={e => setGradeForm({ ...gradeForm, dividendPercent: e.target.value })} /></div>
            </div>
            <p className="text-xs text-muted-foreground">Affecte tous les employés avec ce grade</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button><Button className="flex-1" onClick={updateGrade} disabled={loading}>{loading ? "..." : "Enregistrer"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteGradeId} onOpenChange={v => !v && setDeleteGradeId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer ce grade ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              ⚠️ Le grade sera supprimé définitivement. Impossible si des employés actifs l'utilisent encore.
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteGradeId(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={deleteGrade} disabled={loading}>
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression employé */}
      <Dialog open={!!empToDelete} onOpenChange={v => !v && setEmpToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              </span>
              Supprimer l&apos;employé ?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {empToDelete?.firstName} {empToDelete?.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{empToDelete?.user.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Le compte sera supprimé définitivement. Les commandes et fiches de paie associées sont conservées.
            </p>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setEmpToDelete(null)} disabled={loading}>
                Annuler
              </Button>
              <Button variant="destructive" className="flex-1" onClick={deleteEmployee} disabled={loading}>
                {loading ? "Suppression…" : "Supprimer définitivement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
