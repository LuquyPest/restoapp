"use client"

import { useState } from "react"
import { UserPlus, UserCheck, UserX, Pencil, Award, CreditCard } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Grade { id: string; name: string; salaryPercent: number }
interface Employee {
  id: string; firstName: string; lastName: string
  phone: string | null; accountNumber: string | null
  isActive: boolean; hiredAt: Date
  grade: Grade; user: { email: string }
}
interface Props { employees: Employee[]; grades: Grade[]; currency: string; restaurantId: string }

const EMPTY_EMP = { firstName: "", lastName: "", email: "", password: "", gradeId: "", phone: "", accountNumber: "" }
const EMPTY_GRADE = { name: "", salaryPercent: "" }

export default function EmployeesClient({ employees, grades, restaurantId }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "grade" | "editGrade" | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [empForm, setEmpForm] = useState(EMPTY_EMP)
  const [gradeForm, setGradeForm] = useState(EMPTY_GRADE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      const res = await fetch("/api/employees/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: gradeForm.name, salaryPercent: parseFloat(gradeForm.salaryPercent) }) })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); setGradeForm(EMPTY_GRADE); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function updateGrade() {
    if (!selectedGrade) return
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/employees/grades/${selectedGrade.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: gradeForm.name, salaryPercent: parseFloat(gradeForm.salaryPercent) }) })
      if (!res.ok) throw new Error("Erreur")
      setModal(null); setSelectedGrade(null); router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/employees/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) })
    router.refresh()
  }

  function openEditGrade(grade: Grade) { setSelectedGrade(grade); setGradeForm({ name: grade.name, salaryPercent: String(grade.salaryPercent) }); setError(""); setModal("editGrade") }

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employés</h1>
          <p className="page-sub">{employees.filter(e => e.isActive).length} actif{employees.filter(e=>e.isActive).length>1?"s":""} · {employees.length} au total</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setGradeForm(EMPTY_GRADE); setError(""); setModal("grade") }} className="btn-ghost"><Award size={14} /> Nouveau grade</button>
          <button onClick={() => { setEmpForm(EMPTY_EMP); setError(""); setModal("create") }} className="btn-primary"><UserPlus size={14} /> Ajouter</button>
        </div>
      </div>

      {grades.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span className="section-title">Grades</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {grades.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <Award size={13} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{g.name}</span>
                <span className="badge badge-accent">{g.salaryPercent}%</span>
                <button onClick={() => openEditGrade(g)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 2 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--text)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--text-subtle)"}><Pencil size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span className="section-title">Équipe</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {employees.map(emp => (
          <div key={emp.id} className="card" style={{ padding: 16, opacity: emp.isActive ? 1 : 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(108,99,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                {emp.firstName[0]}{emp.lastName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.firstName} {emp.lastName}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.user.email}</p>
              </div>
              <button onClick={() => toggleActive(emp.id, emp.isActive)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
                {emp.isActive ? <UserCheck size={16} style={{ color: "var(--green)" }} /> : <UserX size={16} style={{ color: "var(--red)" }} />}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span className="badge badge-accent"><Award size={9} /> {emp.grade.name}</span>
              <span className="badge badge-muted">{emp.grade.salaryPercent}% du CA net</span>
              {!emp.isActive && <span className="badge badge-red">Inactif</span>}
            </div>
            {emp.accountNumber && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                <CreditCard size={11} />
                <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{emp.accountNumber}</span>
              </div>
            )}
            <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>Date de recrutement : {formatDate(emp.hiredAt)}</p>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="card" style={{ gridColumn: "1/-1", padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Aucun employé</p>
            <button onClick={() => setModal("create")} className="btn-primary">Ajouter le premier employé</button>
          </div>
        )}
      </div>

      <Modal open={modal === "create"} onClose={() => setModal(null)} title="Ajouter un employé">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label className="label">Prénom</label><input className="input" value={empForm.firstName} onChange={e => setEmpForm({ ...empForm, firstName: e.target.value })} /></div>
            <div><label className="label">Nom</label><input className="input" value={empForm.lastName} onChange={e => setEmpForm({ ...empForm, lastName: e.target.value })} /></div>
          </div>
          <div><label className="label">Email de connexion</label><input type="email" className="input" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} /></div>
          <div><label className="label">Mot de passe initial</label><input type="password" className="input" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label className="label">Téléphone</label><input className="input" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} /></div>
            <div><label className="label">Numéro de compte</label><input className="input" placeholder="ex: 1234-5678" value={empForm.accountNumber} onChange={e => setEmpForm({ ...empForm, accountNumber: e.target.value })} /></div>
          </div>
          <div>
            <label className="label">Grade</label>
            <select className="input" value={empForm.gradeId} onChange={e => setEmpForm({ ...empForm, gradeId: e.target.value })}>
              <option value="">Sélectionner un grade</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name} — {g.salaryPercent}%</option>)}
            </select>
          </div>
          {error && <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
            <button onClick={createEmployee} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? "Création..." : "Créer"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "grade"} onClose={() => setModal(null)} title="Nouveau grade" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label className="label">Nom du grade</label><input className="input" placeholder="Serveur, Manager..." value={gradeForm.name} onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })} /></div>
          <div>
            <label className="label">Pourcentage du CA net</label>
            <div style={{ position: "relative" }}>
              <input type="number" min="0" max="100" step="0.1" className="input" style={{ paddingRight: 32 }} value={gradeForm.salaryPercent} onChange={e => setGradeForm({ ...gradeForm, salaryPercent: e.target.value })} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13 }}>%</span>
            </div>
          </div>
          {error && <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
            <button onClick={createGrade} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? "..." : "Créer"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === "editGrade"} onClose={() => setModal(null)} title="Modifier le grade" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label className="label">Nom du grade</label><input className="input" value={gradeForm.name} onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })} /></div>
          <div>
            <label className="label">Pourcentage du CA net</label>
            <div style={{ position: "relative" }}>
              <input type="number" min="0" max="100" step="0.1" className="input" style={{ paddingRight: 32 }} value={gradeForm.salaryPercent} onChange={e => setGradeForm({ ...gradeForm, salaryPercent: e.target.value })} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13 }}>%</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 6 }}>Affecte tous les employés avec ce grade</p>
          </div>
          {error && <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
            <button onClick={updateGrade} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? "..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
