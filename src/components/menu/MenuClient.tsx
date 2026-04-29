"use client"

import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Image as ImageIcon } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface MenuItem { id: string; name: string; description: string | null; price: number; costPrice: number; category: string; isAvailable: boolean; imageUrl: string | null }
const EMPTY = { name: "", description: "", price: "", costPrice: "", category: "", imageUrl: "", isAvailable: true }

interface Props { items: MenuItem[]; role: string; currency: string }

export default function MenuClient({ items, role, currency }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [imgError, setImgError] = useState(false)

  const fmt = (n: number) => formatCurrency(n, currency)
  const canEdit = role !== "EMPLOYEE"
  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items])
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  function openCreate() { setForm(EMPTY); setImgError(false); setModal("create") }
  function openEdit(item: MenuItem) {
    setSelected(item)
    setForm({ name: item.name, description: item.description ?? "", price: String(item.price), costPrice: String(item.costPrice), category: item.category, imageUrl: item.imageUrl ?? "", isAvailable: item.isAvailable })
    setImgError(false); setModal("edit")
  }

  async function save() {
    setLoading(true)
    const payload = { ...form, price: parseFloat(form.price as string), costPrice: parseFloat(form.costPrice as string) || 0 }
    if (modal === "create") await fetch("/api/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/menu/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet article ?")) return
    await fetch(`/api/menu/${id}`, { method: "DELETE" })
    router.refresh()
  }

  async function toggleAvail(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !item.isAvailable }) })
    router.refresh()
  }

  const previewUrl = form.imageUrl && (form.imageUrl as string).startsWith("http") ? form.imageUrl : null

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carte</h1>
          <p className="page-sub">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>
        {canEdit && <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Ajouter un article</button>}
      </div>

      <div style={{ position: "relative", marginBottom: 24 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
        <input className="input" placeholder="Rechercher..." style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span className="section-title">{cat}</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>{catItems.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {catItems.map(item => (
              <div key={item.id} className="card" style={{ overflow: "hidden", opacity: item.isAvailable ? 1 : 0.5, transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
              >
                {item.imageUrl ? (
                  <div style={{ height: 130, overflow: "hidden", background: "var(--bg)" }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                ) : (
                  <div style={{ height: 90, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon size={22} style={{ color: "var(--text-subtle)" }} />
                  </div>
                )}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{item.name}</p>
                      {item.description && <p style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{item.description}</p>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)" }}>{fmt(item.price)}</p>
                      {item.costPrice > 0 && <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>coût : {fmt(item.costPrice)}</p>}
                    </div>
                  </div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <button onClick={() => toggleAvail(item)} className="btn-ghost" style={{ height: 28, padding: "0 10px", fontSize: 12, flex: 1 }}>
                        {item.isAvailable ? <><EyeOff size={11} /> Masquer</> : <><Eye size={11} /> Activer</>}
                      </button>
                      <button onClick={() => openEdit(item)} className="btn-ghost" style={{ height: 28, width: 28, padding: 0 }}><Pencil size={12} /></button>
                      <button onClick={() => remove(item.id)} className="btn-danger" style={{ height: 28, width: 28, padding: 0 }}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="card" style={{ padding: 64, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Aucun article dans la carte</p>
          {canEdit && <button onClick={openCreate} className="btn-primary">Ajouter le premier article</button>}
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "Nouvel article" : "Modifier l'article"} size="md">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Nom</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className="label">Prix de vente</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Coût de revient</label>
              <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <input className="input" placeholder="Plats, Boissons..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Image (URL)</label>
            <input className="input" placeholder="https://..." value={form.imageUrl} onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImgError(false) }} />
            {previewUrl && !imgError && (
              <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", height: 100, background: "var(--bg)", border: "1px solid var(--border)" }}>
                <img src={previewUrl as string} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgError(true)} />
              </div>
            )}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} style={{ accentColor: "var(--accent)", width: 15, height: 15 }} />
            <span style={{ fontSize: 13, color: "var(--text)" }}>Disponible à la vente</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
            <button onClick={save} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
