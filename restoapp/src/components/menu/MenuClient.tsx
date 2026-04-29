"use client"

import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface MenuItem { id: string; name: string; description: string | null; price: number; category: string; isAvailable: boolean }
const EMPTY = { name: "", description: "", price: "", category: "", isAvailable: true }

interface Props { items: MenuItem[]; role: string; currency: string }

export default function MenuClient({ items, role, currency }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fmt = (n: number) => formatCurrency(n, currency)
  const canEdit = role !== "EMPLOYEE"

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items])
  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const catItems = filtered.filter((i) => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  function openCreate() { setForm(EMPTY); setModal("create") }
  function openEdit(item: MenuItem) { setSelected(item); setForm({ name: item.name, description: item.description ?? "", price: String(item.price), category: item.category, isAvailable: item.isAvailable }); setModal("edit") }

  async function save() {
    setLoading(true)
    const payload = { ...form, price: parseFloat(form.price as string) }
    if (modal === "create") {
      await fetch("/api/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    } else if (selected) {
      await fetch(`/api/menu/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    }
    setLoading(false); setModal(null); router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet article ?")) return
    await fetch(`/api/menu/${id}`, { method: "DELETE" })
    router.refresh()
  }

  async function toggleAvailable(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !item.isAvailable }) })
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Carte</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un article
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
        <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{cat}</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {catItems.map((item) => (
              <div key={item.id} className={`px-5 py-3.5 flex items-center gap-4 ${!item.isAvailable ? "opacity-50" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text)]">{item.name}</p>
                    {!item.isAvailable && <span className="badge badge-danger">Indisponible</span>}
                  </div>
                  {item.description && <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{item.description}</p>}
                </div>
                <p className="text-sm font-bold text-brand-500 flex-shrink-0">{fmt(item.price)}</p>
                {canEdit && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleAvailable(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--text-muted)] hover:bg-[var(--bg)] transition-all" title={item.isAvailable ? "Masquer" : "Rendre disponible"}>
                      {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--text-muted)] hover:bg-[var(--bg)] transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)]">Aucun article dans la carte.</p>
          {canEdit && <button onClick={openCreate} className="btn-primary mt-4">Ajouter le premier article</button>}
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "Nouvel article" : "Modifier l'article"}>
        <div className="space-y-4">
          <div>
            <label className="label">Nom</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prix</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <input className="input" placeholder="Entrées, Plats..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
            <span className="text-sm text-[var(--text)]">Disponible à la vente</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={save} disabled={loading} className="btn-primary flex-1">{loading ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
