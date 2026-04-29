"use client"

import { useState } from "react"
import { Save, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Restaurant {
  id: string
  name: string
  currency: string
  taxRate: number
}

export default function SettingsClient({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: restaurant.name,
    currency: restaurant.currency,
    taxRate: String(restaurant.taxRate),
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setLoading(true)
    await fetch("/api/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        currency: form.currency,
        taxRate: parseFloat(form.taxRate),
      }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-in max-w-xl">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Configuration de votre établissement</p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="section-title">Informations générales</h2>

        <div>
          <label className="label">Nom de l'établissement</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Symbole monétaire</label>
          <input
            className="input w-28"
            placeholder="$, €, ..."
            maxLength={5}
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Ce symbole sera affiché partout dans l'application
          </p>
        </div>

        <div>
          <label className="label">Taux de taxes par défaut (%)</label>
          <div className="relative w-40">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input pr-8"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Appliqué par défaut lors de la génération des payes
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Enregistré
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="section-title">Accès et rôles</h2>
        <div className="space-y-2 text-sm text-[var(--text-muted)]">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]">
            <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-[var(--text)]">Patron (OWNER)</p>
              <p>Accès complet — gestion des employés, paramètres, payes, fournisseurs, factures</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-[var(--text)]">Manager (MANAGER)</p>
              <p>Gestion des employés, commandes, fournisseurs et factures — pas les paramètres</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]">
            <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-[var(--text)]">Employé (EMPLOYEE)</p>
              <p>Tableau de bord personnel, prise de commandes, consultation de la carte et de ses payes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
