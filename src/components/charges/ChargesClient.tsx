"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Charge { id: string; name: string; amount: number; isActive: boolean }
interface Props { charges: Charge[]; currency: string }

const EMPTY = { name: "", amount: "" }

export default function ChargesClient({ charges, currency }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Charge | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) => formatCurrency(n, currency)
  const totalActive = charges.filter(c => c.isActive).reduce((s, c) => s + c.amount, 0)

  async function save() {
    setLoading(true)
    const payload = { name: form.name, amount: parseFloat(form.amount) }
    if (modal === "create") await fetch("/api/charges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/charges/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function toggle(c: Charge) {
    await fetch(`/api/charges/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette charge ?")) return
    await fetch(`/api/charges/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Charges fixes</h1>
          <p className="page-sub">Total actif : {fmt(totalActive)} / semaine</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal("create") }} className="btn-primary">
          <Plus size={14} /> Ajouter une charge
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nom</th><th>Montant</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {charges.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune charge configurée</td></tr>
            ) : charges.map(c => (
              <tr key={c.id} style={{ opacity: c.isActive ? 1 : 0.5 }}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ fontWeight: 700 }}>{fmt(c.amount)}</td>
                <td>
                  {c.isActive
                    ? <span className="badge badge-green">Active</span>
                    : <span className="badge badge-muted">Inactive</span>}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => toggle(c)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }} title={c.isActive ? "Désactiver" : "Activer"}>
                      {c.isActive ? <ToggleRight size={18} style={{ color: "var(--green)" }} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => { setSelected(c); setForm({ name: c.name, amount: String(c.amount) }); setModal("edit") }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--red)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-subtle)"}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "Nouvelle charge" : "Modifier la charge"} size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Nom de la charge</label>
            <input className="input" placeholder="ex: Loyer, Électricité..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Montant</label>
            <input type="number" min="0" step="0.01" className="input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
            <button onClick={save} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? "..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
