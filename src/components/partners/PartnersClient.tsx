"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Handshake } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useRouter } from "next/navigation"

interface Partner { id: string; name: string; discountPercent: number; isActive: boolean }
const EMPTY = { name: "", discountPercent: "" }

export default function PartnersClient({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Partner | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    const payload = { name: form.name, discountPercent: parseFloat(form.discountPercent) }
    if (modal === "create") await fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/partners/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function toggle(p: Partner) {
    await fetch(`/api/partners/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) })
    router.refresh()
  }

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Partenaires</h1>
          <p className="page-sub">{partners.filter(p => p.isActive).length} partenaire{partners.filter(p=>p.isActive).length > 1 ? "s" : ""} actif{partners.filter(p=>p.isActive).length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal("create") }} className="btn-primary">
          <Plus size={14} /> Ajouter un partenaire
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {partners.map(p => (
          <div key={p.id} className="card" style={{ padding: 20, opacity: p.isActive ? 1 : 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid rgba(108,99,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Handshake size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Remise {p.discountPercent}%</p>
              </div>
              <span className={`badge ${p.isActive ? "badge-green" : "badge-muted"}`}>{p.isActive ? "Actif" : "Inactif"}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggle(p)} className="btn-ghost" style={{ flex: 1, height: 30, fontSize: 12 }}>
                {p.isActive ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => { setSelected(p); setForm({ name: p.name, discountPercent: String(p.discountPercent) }); setModal("edit") }} className="btn-ghost" style={{ height: 30, width: 30, padding: 0 }}>
                <Pencil size={13} />
              </button>
            </div>
          </div>
        ))}

        {partners.length === 0 && (
          <div className="card" style={{ gridColumn: "1/-1", padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Aucun partenaire configuré</p>
            <button onClick={() => setModal("create")} className="btn-primary">Ajouter le premier partenaire</button>
          </div>
        )}
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "Nouveau partenaire" : "Modifier le partenaire"} size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Nom du partenaire</label>
            <input className="input" placeholder="ex: Mairie, Hôpital..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Pourcentage de réduction</label>
            <div style={{ position: "relative" }}>
              <input type="number" min="0" max="100" step="0.1" className="input" style={{ paddingRight: 32 }} placeholder="10" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13 }}>%</span>
            </div>
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
