"use client"

import { useState } from "react"
import { UserPlus, Pencil, Trash2, UserCheck, UserX } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Grade { id: string; name: string; salaryPercent: number }
interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  hiredAt: Date
  grade: Grade
  user: { email: string }
}

interface Props {
  employees: Employee[]
  grades: Grade[]
  currency: string
  restaurantId: string
}

const EMPTY = { firstName: "", lastName: "", email: "", password: "", gradeId: "", phone: "" }

export default function EmployeesClient({ employees, grades, restaurantId }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "grade" | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [gradeForm, setGradeForm] = useState({ name: "", salaryPercent: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function createEmployee() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setModal(null); setForm(EMPTY); router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function createGrade() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/employees/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gradeForm.name, salaryPercent: parseFloat(gradeForm.salaryPercent) }),
      })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); setGradeForm({ name: "", salaryPercent: "" }); router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Employés</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{employees.length} membre{employees.length > 1 ? "s" : ""} dans l'équipe</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setModal("grade"); setError("") }} className="btn-secondary">
            Nouveau grade
          </button>
          <button onClick={() => { setModal("create"); setError("") }} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Ajouter un employé
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <div key={emp.id} className={`card p-4 space-y-3 ${!emp.isActive ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-brand-500">
                  {emp.firstName[0]}{emp.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">{emp.firstName} {emp.lastName}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{emp.user.email}</p>
              </div>
              <button onClick={() => toggleActive(emp.id, emp.isActive)} className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors" title={emp.isActive ? "Désactiver" : "Activer"}>
                {emp.isActive ? <UserCheck className="w-4 h-4 text-green-500" /> : <UserX className="w-4 h-4 text-red-400" />}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-info">{emp.grade.name}</span>
              <span className="badge bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]">
                {emp.grade.salaryPercent}%
              </span>
              {!emp.isActive && <span className="badge badge-danger">Inactif</span>}
            </div>

            <div className="text-xs text-[var(--text-subtle)]">
              Embauché le {formatDate(emp.hiredAt)}
              {emp.phone && <span className="ml-2">· {emp.phone}</span>}
            </div>
          </div>
        ))}
      </div>

      {grades.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="section-title">Grades configurés</h2>
          </div>
          <table className="table">
            <thead><tr><th>Grade</th><th>% salaire</th></tr></thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="font-medium">{g.name}</td>
                  <td><span className="badge badge-info">{g.salaryPercent}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal === "create"} onClose={() => setModal(null)} title="Ajouter un employé">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom</label>
              <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="label">Nom</label>
              <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Email de connexion</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Mot de passe initial</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Téléphone (optionnel)</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Grade</label>
            <select className="input" value={form.gradeId} onChange={(e) => setForm({ ...form, gradeId: e.target.value })}>
              <option value="">Sélectionner un grade</option>
              {grades.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.salaryPercent}%)</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={createEmployee} disabled={loading} className="btn-primary flex-1">
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "grade"} onClose={() => setModal(null)} title="Nouveau grade" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nom du grade</label>
            <input className="input" placeholder="ex: Serveur, Manager..." value={gradeForm.name} onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Pourcentage de salaire</label>
            <div className="relative">
              <input type="number" min="0" max="100" step="0.1" className="input pr-8" placeholder="10" value={gradeForm.salaryPercent} onChange={(e) => setGradeForm({ ...gradeForm, salaryPercent: e.target.value })} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
            </div>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={createGrade} disabled={loading} className="btn-primary flex-1">
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
