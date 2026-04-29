"use client"

import { useState, useEffect, useCallback } from "react"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react"

function getISOWeek(d: Date) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

interface ReportData {
  revenue: number; costRevenue: number; salaries: number; charges: number
  taxes: number; partnerRevenue: number; clientRevenue: number
  grossProfit: number; netProfit: number
  dividend: number; treasury: number; taxDeclared: boolean
  weekNumber: number; year: number
}

interface Props { currency: string; taxRate: number }

export default function ReportClient({ currency, taxRate }: Props) {
  const now = new Date()
  const [week, setWeek] = useState(getISOWeek(now))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dividend, setDividend] = useState("")
  const [treasury, setTreasury] = useState("")

  const fmt = (n: number) => formatCurrency(n, currency)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/report?week=${week}&year=${year}`)
      const d = await res.json()
      setData(d)
      setDividend(String(d.dividend ?? 0))
      setTreasury(String(d.treasury ?? 0))
    } finally { setLoading(false) }
  }, [week, year])

  useEffect(() => { fetchReport() }, [fetchReport])

  async function save() {
    setSaving(true)
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, year, dividend: parseFloat(dividend) || 0, treasury: parseFloat(treasury) || 0 }),
    })
    setSaving(false)
    fetchReport()
  }

  function prevWeek() {
    if (week === 1) { setWeek(52); setYear(y => y - 1) }
    else setWeek(w => w - 1)
  }
  function nextWeek() {
    if (week === 52) { setWeek(1); setYear(y => y + 1) }
    else setWeek(w => w + 1)
  }

  const Row = ({ label, value, sub, highlight, indent }: { label: string; value: string; sub?: string; highlight?: boolean; indent?: boolean }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0",
      borderBottom: highlight ? "1px solid var(--border-mid)" : "1px solid var(--border)",
    }}>
      <span style={{ fontSize: highlight ? 14 : 13, fontWeight: highlight ? 600 : 400, color: highlight ? "var(--text)" : "var(--text-muted)", paddingLeft: indent ? 12 : 0 }}>
        {label}
      </span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: highlight ? 15 : 13, fontWeight: highlight ? 700 : 500, color: highlight ? "var(--text)" : "var(--text-muted)" }}>{value}</span>
        {sub && <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  )

  return (
    <div className="animate-up">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Bilan hebdomadaire</h1>
        <p className="page-sub">Résumé financier par semaine</p>
      </div>

      {/* Week selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={prevWeek} className="btn-ghost" style={{ width: 36, height: 36, padding: 0 }}><ChevronLeft size={16} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", borderRadius: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>S{String(week).padStart(2, "0")}</span>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{year}</span>
        </div>
        <button onClick={nextWeek} className="btn-ghost" style={{ width: 36, height: 36, padding: 0 }}><ChevronRight size={16} /></button>
        <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>Taux d'imposition : {taxRate}%</span>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Chargement...</div>
      ) : data ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Column 1: CA */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Chiffre d'affaires</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>{fmt(data.revenue)}</span>
            </div>
            <div style={{ padding: "8px 16px 16px" }}>
              <Row label="Salaires et notes de frais" value={fmt(data.salaries)} highlight />
              <Row label="Salaires" value={fmt(data.salaries)} indent />
              <Row label="Notes de frais" value={fmt(0)} indent />
              <div style={{ marginTop: 8 }} />
              <Row label="Charges déductibles" value={fmt(data.charges)} highlight />
              <Row label="Coût de revient des ventes" value={fmt(data.costRevenue)} indent />
              <div style={{ marginTop: 8 }} />
              <Row label="Bénéfice brut imposable" value={fmt(data.grossProfit)} highlight />
              <Row label={`Impôts (${taxRate}%)`} value={fmt(data.taxes)} indent />
              <div style={{ marginTop: 8 }} />
              <Row label="Bénéfice net" value={fmt(data.netProfit)} highlight />
              <Row label="Primes" value={fmt(0)} indent />
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", paddingLeft: 12 }}>Dividende</span>
                  <input type="number" min="0" step="0.01" style={{ width: 100, textAlign: "right", background: "var(--bg)", border: "1px solid var(--border-mid)", borderRadius: 6, padding: "3px 8px", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }}
                    value={dividend} onChange={e => setDividend(e.target.value)} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", paddingLeft: 12 }}>Trésorerie</span>
                  <input type="number" min="0" step="0.01" style={{ width: 100, textAlign: "right", background: "var(--bg)", border: "1px solid var(--border-mid)", borderRadius: 6, padding: "3px 8px", color: "var(--text)", fontSize: 13, fontFamily: "inherit" }}
                    value={treasury} onChange={e => setTreasury(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Charges */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Charges</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--amber)" }}>{fmt(data.charges + data.salaries)}</span>
            </div>
            <div style={{ padding: "8px 16px 16px" }}>
              <Row label="Charges non déductibles" value={fmt(0)} highlight />
              <div style={{ marginTop: 8 }} />
              <Row label="Charges déductibles" value={fmt(data.charges + data.salaries)} highlight />
              <Row label="Coût de revient des ventes" value={fmt(data.costRevenue)} indent />
              <Row label="Salaires" value={fmt(data.salaries)} indent />
              <Row label="Charges fixes" value={fmt(data.charges)} indent />
              <div style={{ marginTop: 16, padding: "12px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={13} style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Impôts calculés au taux de {taxRate}% sur le bénéfice brut. Modifiable dans les Paramètres.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Ventes */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Ventes</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--green)" }}>{fmt(data.revenue)}</span>
            </div>
            <div style={{ padding: "8px 16px 16px" }}>
              <Row label="Ventes aux clients" value={fmt(data.clientRevenue)} highlight />
              <Row label="Ventes aux partenaires" value={fmt(data.partnerRevenue)} highlight />
            </div>
          </div>
        </div>
      ) : null}

      {data && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ gap: 8 }}>
            <Save size={14} />
            {saving ? "Enregistrement..." : "Enregistrer le bilan"}
          </button>
        </div>
      )}
    </div>
  )
}
