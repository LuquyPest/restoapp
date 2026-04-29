"use client"

import { useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calculator, CheckCircle, Clock, Plus } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useRouter } from "next/navigation"

interface Grade { name: string; salaryPercent: number }
interface Employee { id: string; firstName: string; lastName: string; grade: Grade }
interface Payroll {
  id: string
  periodStart: Date
  periodEnd: Date
  revenue: number
  grossSalary: number
  taxes: number
  bonus: number
  netSalary: number
  isPaid: boolean
  employee: Employee & { grade: Grade }
}

interface Props {
  payrolls: Payroll[]
  employees: Employee[]
  role: string
  currency: string
  defaultTaxRate: number
}

export default function PayrollClient({ payrolls, employees, role, currency, defaultTaxRate }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [taxRate, setTaxRate] = useState(String(defaultTaxRate))
  const [bonuses, setBonuses] = useState<Record<string, string>>({})

  const fmt = (n: number) => formatCurrency(n, currency)
  const isOwner = role === "OWNER" || role === "MANAGER"

  async function generate() {
    setLoading(true)
    const bonusMap: Record<string, number> = {}
    Object.entries(bonuses).forEach(([id, val]) => {
      if (val) bonusMap[id] = parseFloat(val)
    })
    await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        periodStart,
        periodEnd,
        taxRate: parseFloat(taxRate),
        bonuses: bonusMap,
      }),
    })
    setLoading(false)
    setModal(false)
    router.refresh()
  }

  async function markPaid(id: string) {
    await fetch(`/api/payroll/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: true }),
    })
    router.refresh()
  }

  const totalNet = payrolls.filter((p) => !p.isPaid).reduce((s, p) => s + p.netSalary, 0)

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Payes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {isOwner ? `${payrolls.filter((p) => !p.isPaid).length} en attente — ${fmt(totalNet)} à verser` : "Votre historique de payes"}
          </p>
        </div>
        {isOwner && (
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Générer les payes
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {isOwner && <th>Employé</th>}
              <th>Période</th>
              <th>CA réalisé</th>
              <th>Salaire brut</th>
              <th>Taxes</th>
              <th>Prime</th>
              <th>Net</th>
              <th>Statut</th>
              {isOwner && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 9 : 7} className="text-center text-[var(--text-muted)] py-10">
                  Aucune paye générée pour le moment
                </td>
              </tr>
            ) : (
              payrolls.map((p) => (
                <tr key={p.id}>
                  {isOwner && (
                    <td>
                      <div>
                        <p className="font-medium">{p.employee.firstName} {p.employee.lastName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.employee.grade.name} — {p.employee.grade.salaryPercent}%</p>
                      </div>
                    </td>
                  )}
                  <td className="text-sm text-[var(--text-muted)]">
                    {formatDate(p.periodStart)} → {formatDate(p.periodEnd)}
                  </td>
                  <td className="font-medium">{fmt(p.revenue)}</td>
                  <td>{fmt(p.grossSalary)}</td>
                  <td className="text-[var(--danger)]">−{fmt(p.taxes)}</td>
                  <td className="text-green-600 dark:text-green-400">+{fmt(p.bonus)}</td>
                  <td className="font-bold text-[var(--text)]">{fmt(p.netSalary)}</td>
                  <td>
                    {p.isPaid ? (
                      <span className="badge badge-success">
                        <CheckCircle className="w-3 h-3" /> Versée
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    )}
                  </td>
                  {isOwner && (
                    <td>
                      {!p.isPaid && (
                        <button
                          onClick={() => markPaid(p.id)}
                          className="text-xs text-brand-500 hover:text-brand-600 font-medium hover:underline transition-colors"
                        >
                          Marquer versée
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Générer les payes" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Début de période</label>
              <input
                type="date"
                className="input"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Fin de période</label>
              <input
                type="date"
                className="input"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Taux de taxes / charges (%)</label>
            <div className="relative w-40">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="input pr-8"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
            </div>
          </div>

          {employees.length > 0 && (
            <div>
              <p className="label mb-3">Primes individuelles (optionnel)</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text)]">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{emp.grade.name} — {emp.grade.salaryPercent}%</p>
                    </div>
                    <div className="relative w-32">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input text-sm pr-8"
                        placeholder="0"
                        value={bonuses[emp.id] ?? ""}
                        onChange={(e) => setBonuses((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">$</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
            Le système va calculer automatiquement pour chaque employé actif : CA réalisé × % du grade = salaire brut, puis appliquer les taxes et primes.
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
            <button
              onClick={generate}
              disabled={loading || !periodStart || !periodEnd}
              className="btn-primary flex-1"
            >
              {loading ? "Génération..." : "Générer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
