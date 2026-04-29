"use client"

import { useState } from "react"
import { Plus, Truck, Mail, Phone, FileText } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Supplier {
  id: string; name: string; contact: string | null; email: string | null
  phone: string | null; address: string | null
  _count: { invoices: number }
}

const EMPTY = { name: "", contact: "", email: "", phone: "", address: "" }

export default function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setLoading(false); setModal(false); setForm(EMPTY); router.refresh()
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Fournisseurs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <div key={s.id} className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">{s.name}</p>
                {s.contact && <p className="text-xs text-[var(--text-muted)]">{s.contact}</p>}
              </div>
            </div>
            <div className="space-y-1">
              {s.email && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Mail className="w-3 h-3" /><span className="truncate">{s.email}</span>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Phone className="w-3 h-3" /><span>{s.phone}</span>
                </div>
              )}
            </div>
            <Link href="/invoices" className="flex items-center gap-2 text-xs text-brand-500 hover:text-brand-600 transition-colors">
              <FileText className="w-3 h-3" />
              {s._count.invoices} facture{s._count.invoices > 1 ? "s" : ""}
            </Link>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-3 card p-12 text-center">
            <p className="text-[var(--text-muted)]">Aucun fournisseur enregistré.</p>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau fournisseur" size="sm">
        <div className="space-y-3">
          {(["name", "contact", "email", "phone", "address"] as const).map((field) => (
            <div key={field}>
              <label className="label capitalize">{field === "address" ? "Adresse" : field === "contact" ? "Contact" : field}</label>
              <input className="input" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field === "name"} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? "Création..." : "Créer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
