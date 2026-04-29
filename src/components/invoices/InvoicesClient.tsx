"use client"

import { useState } from "react"
import { Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Supplier { id: string; name: string }
interface Invoice {
  id: string; reference: string | null; amount: number; dueDate: Date
  status: string; note: string | null; supplier: Supplier; createdAt: Date
}

const EMPTY = { supplierId: "", reference: "", amount: "", dueDate: "", note: "" }

export default function InvoicesClient({ invoices, suppliers, currency }: { invoices: Invoice[]; suppliers: Supplier[]; currency: string }) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) => formatCurrency(n, currency)

  const totalPending = invoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + i.amount, 0)

  async function create() {
    setLoading(true)
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    setLoading(false); setModal(false); setForm(EMPTY); router.refresh()
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) })
    router.refresh()
  }

  const statusConfig = {
    PAID: { label: "Payée", icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />, class: "badge-success" },
    PENDING: { label: "En attente", icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, class: "badge-warning" },
    OVERDUE: { label: "En retard", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, class: "badge-danger" },
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Factures</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {invoices.filter((i) => i.status !== "PAID").length} en attente — {fmt(totalPending)} dû
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle facture
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Référence</th>
              <th>Montant</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[var(--text-muted)] py-8">Aucune facture</td></tr>
            ) : invoices.map((inv) => {
              const cfg = statusConfig[inv.status as keyof typeof statusConfig] ?? statusConfig.PENDING
              return (
                <tr key={inv.id}>
                  <td className="font-medium">{inv.supplier.name}</td>
                  <td className="text-[var(--text-muted)]">{inv.reference ?? "—"}</td>
                  <td className="font-semibold">{fmt(inv.amount)}</td>
                  <td className={`text-sm ${inv.status === "OVERDUE" ? "text-[var(--danger)] font-medium" : "text-[var(--text-muted)]"}`}>
                    {formatDate(inv.dueDate)}
                  </td>
                  <td>
                    <div className={`badge ${cfg.class} gap-1`}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </td>
                  <td>
                    {inv.status !== "PAID" && (
                      <button onClick={() => markPaid(inv.id)} className="text-xs text-brand-500 hover:text-brand-600 font-medium hover:underline transition-colors">
                        Marquer payée
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle facture" size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Fournisseur</label>
            <select className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">Sélectionner</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Référence (optionnel)</label>
            <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Montant</label>
              <input type="number" step="0.01" min="0" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">Échéance</label>
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Note (optionnel)</label>
            <textarea className="input resize-none" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={create} disabled={loading || !form.supplierId || !form.amount} className="btn-primary flex-1">{loading ? "Création..." : "Créer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
