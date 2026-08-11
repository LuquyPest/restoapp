"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { formatCurrency, getISOWeek, getISOWeeksInYear } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Download, Loader2, Landmark, CheckCircle2, FileDown, MessageSquare } from "lucide-react"
import { downloadDeclarationReceipt } from "@/lib/declaration-receipt"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BarChart from "@/components/ui/BarChart"
import AuthorityChatTab from "@/components/authority/AuthorityChatTab"
import { AUTHORITY_ROLE_LABELS, type AuthorityRole } from "@/lib/authority"


interface Props { currency: string; bonusRate: number; dividendRate: number; mairieZone: "NORD" | "SUD" | null }

export default function ReportClient({ currency, bonusRate: defaultBonus, dividendRate: defaultDividend, mairieZone }: Props) {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"bilan" | "messages">(searchParams.get("tab") === "messages" ? "messages" : "bilan")
  const mairieRole: AuthorityRole | null = mairieZone === "NORD" ? "MAIRIE_NORD" : mairieZone === "SUD" ? "MAIRIE_SUD" : null
  const [chatRole, setChatRole] = useState<AuthorityRole>((searchParams.get("authority") as AuthorityRole) || "IRS")
  const now = new Date()
  const [week, setWeek] = useState(getISOWeek(now))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [declaring, setDeclaring] = useState(false)
  const [declareError, setDeclareError] = useState("")
  const fmt = (n: number) => formatCurrency(n, currency)
  const pct = (n: number) => `${n?.toFixed(2) ?? 0}%`

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchReport = useCallback(async (w: number, y: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/report?week=${w}&year=${y}`)
      const d = await res.json()
      setData(d)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchReport(week, year), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [week, year, fetchReport])

  async function saveAndDownload() {
    if (!data) return
    setDownloading(true)
    // Save first
    await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ week, year }) })
    // Generate HTML
    generateHTML()
    setDownloading(false)
  }

  async function declareTax() {
    if (!data || data.alreadyDeclared) return
    if (!confirm(`Déclarer l'impôt de la semaine S${String(week).padStart(2,"0")} ${year} ? Cette action est définitive, les chiffres seront figés.`)) return
    setDeclaring(true); setDeclareError("")
    try {
      const res = await fetch("/api/report/declare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ week, year }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Erreur")
      setData((prev: any) => prev ? { ...prev, alreadyDeclared: true, declaration: d } : prev)
    } catch (e: any) { setDeclareError(e.message) }
    finally { setDeclaring(false) }
  }

  function generateHTML() {
    if (!data) return
    const c = currency
    const f = (n: number) => `${c}${(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const fd = (d: any) => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Bilan S${String(week).padStart(2,"0")} ${year} — ${data.companyName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; padding: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; letter-spacing: -0.02em; }
  h2 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
  .card-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .card-value { font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.02em; }
  .card-value.green { color: #16a34a; }
  .card-value.red { color: #dc2626; }
  .card-value.blue { color: #6c63ff; }
  .card-value.amber { color: #d97706; }
  .bilan-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .bilan-row.bold { font-weight: 600; border-bottom: 1px solid #e5e7eb; }
  .bilan-row.indent { padding-left: 16px; color: #6b7280; }
  .bilan-row span:last-child { font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
  th { background: #f3f4f6; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  tr:hover td { background: #fafafa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .badge-amber { background: #fef3c7; color: #d97706; }
  .badge-gray { background: #f3f4f6; color: #6b7280; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 80px; margin: 12px 0; }
  .bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; background: #6c63ff; border-radius: 4px 4px 0 0; min-height: 2px; }
  .bar-label { font-size: 10px; color: #9ca3af; font-weight: 500; }
  .section { margin-bottom: 36px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  .mono { font-family: 'Courier New', monospace; }
</style>
</head>
<body>
<h1>${data.companyName} — Bilan hebdomadaire</h1>
<p class="subtitle">Semaine S${String(week).padStart(2,"0")} ${year} · Du ${data.weekStart} au ${data.weekEnd} · Généré le ${new Date().toLocaleDateString("fr-FR")}</p>

<!-- KPIs -->
<div class="grid3">
  <div class="card"><div class="card-title">Chiffre d'affaires</div><div class="card-value blue">${f(data.revenue)}</div></div>
  <div class="card"><div class="card-title">Bénéfice net</div><div class="card-value ${(data.netProfit ?? 0) >= 0 ? "green" : "red"}">${f(data.netProfit)}</div></div>
  <div class="card"><div class="card-title">Trésorerie</div><div class="card-value">${f(data.treasury)}</div></div>
</div>

<!-- Ventes par jour -->
<div class="section">
<h2>Ventes par jour</h2>
${(() => {
  const maxVal = Math.max(...(data.dailyData ?? []).map((d: any) => d.value), 1)
  return `<div class="bar-chart">${(data.dailyData ?? []).map((d: any) => {
    const h = Math.max((d.value / maxVal) * 70, d.value > 0 ? 4 : 0)
    return `<div class="bar-wrap"><div class="bar" style="height:${h}px" title="${f(d.value)}"></div><div class="bar-label">${d.label}</div></div>`
  }).join("")}</div>`
})()}
<table><thead><tr><th>Jour</th><th>Date</th><th>CA</th></tr></thead><tbody>
${(data.dailyData ?? []).map((d: any) => `<tr><td>${d.label}</td><td>${d.date}</td><td><strong>${f(d.value)}</strong></td></tr>`).join("")}
</tbody></table>
</div>

<!-- Bilan financier -->
<div class="section">
<h2>Bilan financier</h2>
<div class="grid3">
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Compte de résultat</div>
  <div class="bilan-row bold"><span>Chiffre d'affaires</span><span>${f(data.revenue)}</span></div>
  <div class="bilan-row bold"><span>− Salaires</span><span style="color:#d97706">${f(data.totalSalaries)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice après salaires</span><span>${f(data.afterSalaries)}</span></div>
  <div class="bilan-row bold"><span>− Charges déductibles</span><span style="color:#d97706">${f(data.chargesDeductible)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice brut</span><span>${f(data.grossProfit)}</span></div>
  <div class="bilan-row indent"><span>− Impôts (${pct(data.taxRate)})</span><span style="color:#dc2626">${f(data.taxes)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice net</span><span style="color:#16a34a">${f(data.netProfit)}</span></div>
  <div class="bilan-row indent"><span>− Prime employés (${pct(data.bonusRate)})</span><span style="color:#d97706">${f(data.bonusTotal)}</span></div>
  <div class="bilan-row bold"><span>Après prime</span><span>${f(data.afterBonus)}</span></div>
  <div class="bilan-row indent"><span>Dividendes (${pct(data.dividendRate)})</span><span>${f(data.dividendTotal)}</span></div>
  <div class="bilan-row indent"><span>Trésorerie</span><span>${f(data.treasury)}</span></div>
  <div class="bilan-row indent"><span>− Charges non déductibles</span><span style="color:#dc2626">${f(data.chargesNonDeductible)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice final</span><span style="color:${(data.finalProfit ?? 0) >= 0 ? "#16a34a" : "#dc2626"}">${f(data.finalProfit)}</span></div>
</div>
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Charges</div>
  <div class="bilan-row bold"><span>Total déductibles</span><span>${f(data.chargesDeductible)}</span></div>
  ${(data.charges ?? []).filter((c: any) => c.type === "DEDUCTIBLE").map((c: any) => `<div class="bilan-row indent"><span>${c.name}</span><span>${f(c.amount)}</span></div>`).join("")}
  <div class="bilan-row bold" style="margin-top:8px"><span>Total non déductibles</span><span>${f(data.chargesNonDeductible)}</span></div>
  ${(data.charges ?? []).filter((c: any) => c.type === "NON_DEDUCTIBLE").map((c: any) => `<div class="bilan-row indent"><span>${c.name}</span><span>${f(c.amount)}</span></div>`).join("")}
</div>
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Ventes</div>
  <div class="bilan-row bold"><span>Clients directs</span><span>${f(data.clientRevenue)}</span></div>
  <div class="bilan-row bold"><span>Partenaires</span><span>${f(data.partnerRevenue)}</span></div>
  ${(data.partnerSummary ?? []).map((p: any) => `<div class="bilan-row indent"><span>${p.name}</span><span>${f(p.revenue)}</span></div>`).join("")}
</div>
</div>
</div>

<!-- Employés -->
<div class="section">
<h2>Employés</h2>
<table><thead><tr><th>Nom</th><th>Grade</th><th>N° Compte</th><th>CA brut</th><th>Coût revient</th><th>CA net</th><th>% Salaire</th><th>Salaire</th><th>% Dividende</th><th>Dividende</th></tr></thead><tbody>
${(data.employeeStats ?? []).map((e: any) => `
<tr>
  <td><strong>${e.firstName} ${e.lastName}</strong></td>
  <td>${e.grade}</td>
  <td class="mono">${e.accountNumber ?? "—"}</td>
  <td>${f(e.revenue)}</td>
  <td style="color:#d97706">−${f(e.costRevenue)}</td>
  <td><strong>${f(e.netRevenue)}</strong></td>
  <td><span class="badge badge-gray">${e.salaryPercent}%</span></td>
  <td style="color:#16a34a"><strong>${f(e.salary)}</strong></td>
  <td><span class="badge badge-gray">${e.dividendPercent ?? 0}%</span></td>
  <td style="color:#6c63ff"><strong>${f(e.dividend ?? 0)}</strong></td>
</tr>`).join("")}
</tbody></table>
</div>

<!-- Ventes par produit -->
<div class="section">
<h2>Ventes par produit</h2>
<table><thead><tr><th>Produit</th><th>Catégorie</th><th>Qté</th><th>CA</th><th>Coût</th><th>Marge</th></tr></thead><tbody>
${(data.productStats ?? []).map((p: any) => `
<tr>
  <td><strong>${p.name}</strong></td>
  <td>${p.category}</td>
  <td>${p.qty}</td>
  <td>${f(p.revenue)}</td>
  <td style="color:#d97706">−${f(p.cost)}</td>
  <td style="color:${(p.revenue - p.cost) >= 0 ? "#16a34a" : "#dc2626"}"><strong>${f(p.revenue - p.cost)}</strong></td>
</tr>`).join("")}
</tbody></table>
</div>

<!-- Partenaires -->
<div class="section">
<h2>Partenaires</h2>
<table><thead><tr><th>Nom</th><th>Remise</th><th>Statut</th><th>CA semaine</th><th>Remise accordée</th></tr></thead><tbody>
${(data.partners ?? []).map((p: any) => {
  const stats = (data.partnerSummary ?? []).find((s: any) => s.name === p.name)
  return `<tr>
    <td><strong>${p.name}</strong></td>
    <td>${p.discount}%</td>
    <td><span class="badge ${p.isActive ? "badge-green" : "badge-gray"}">${p.isActive ? "Actif" : "Inactif"}</span></td>
    <td>${stats ? f(stats.revenue) : "—"}</td>
    <td style="color:#16a34a">${stats ? `−${f(stats.discount)}` : "—"}</td>
  </tr>`
}).join("")}
</tbody></table>
</div>

<!-- Cartes de fidélité -->
<div class="section">
<h2>Cartes de fidélité</h2>
<table><thead><tr><th>Client</th><th>Remise</th><th>Expire le</th><th>Statut</th></tr></thead><tbody>
${(data.loyaltyCards ?? []).map((c: any) => {
  const exp = new Date(c.expiresAt)
  const expired = exp < new Date()
  return `<tr>
    <td><strong>${c.name}</strong></td>
    <td>${c.discount}%</td>
    <td>${fd(c.expiresAt)}</td>
    <td><span class="badge ${expired ? "badge-red" : c.isActive ? "badge-green" : "badge-gray"}">${expired ? "EXPIRÉE" : c.isActive ? "Active" : "Inactive"}</span></td>
  </tr>`
}).join("")}
</tbody></table>
</div>

<!-- Fournisseurs & Factures -->
<div class="section">
<h2>Fournisseurs</h2>
<table><thead><tr><th>Nom</th><th>Contact</th><th>Email</th><th>Téléphone</th></tr></thead><tbody>
${(data.suppliers ?? []).map((s: any) => `<tr><td><strong>${s.name}</strong></td><td>${s.contact ?? "—"}</td><td>${s.email ?? "—"}</td><td>${s.phone ?? "—"}</td></tr>`).join("")}
</tbody></table>

<h2>Factures</h2>
<table><thead><tr><th>Référence</th><th>Fournisseur</th><th>Montant</th><th>Échéance</th><th>Statut</th></tr></thead><tbody>
${(data.invoices ?? []).map((i: any) => `<tr>
  <td>${i.ref ?? "—"}</td>
  <td>${i.supplier}</td>
  <td><strong>${f(i.amount)}</strong></td>
  <td>${fd(i.dueDate)}</td>
  <td><span class="badge ${i.status === "PAID" ? "badge-green" : i.status === "OVERDUE" ? "badge-red" : "badge-amber"}">${i.status === "PAID" ? "Payée" : i.status === "OVERDUE" ? "En retard" : "En attente"}</span></td>
</tr>`).join("")}
</tbody></table>
</div>

<!-- Liste des ventes (commandes) -->
<div class="section">
<h2>Liste des ventes — ${(data.allOrders ?? []).length} commandes</h2>
<table><thead><tr><th>Employé</th><th>Articles</th><th>Partenaire</th><th>Remise</th><th>Total</th><th>Date</th></tr></thead><tbody>
${(data.allOrders ?? []).slice(0, 100).map((o: any) => `<tr>
  <td>${o.employeeName}</td>
  <td style="font-size:11px;max-width:200px">${o.lines.map((l: any) => `${l.qty}× ${l.name}`).join(", ")}</td>
  <td>${o.partnerName ?? o.loyaltyName ?? "—"}</td>
  <td style="color:#16a34a">${o.discountAmount > 0 ? `−${f(o.discountAmount)}` : "—"}</td>
  <td><strong>${f(o.total)}</strong></td>
  <td style="font-size:11px">${new Date(o.createdAt).toLocaleString("fr-FR")}</td>
</tr>`).join("")}
</tbody></table>
</div>

<div class="footer">Bilan généré le ${new Date().toLocaleString("fr-FR")} · ${data.companyName} · Semaine ${week} ${year}</div>
</body>
</html>`

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bilan-S${String(week).padStart(2,"0")}-${year}-${data.companyName.replace(/\s/g,"-")}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function prevWeek() {
    if (week === 1) { const py = year - 1; setYear(py); setWeek(getISOWeeksInYear(py)) }
    else setWeek(w => w - 1)
  }
  function nextWeek() {
    if (week >= getISOWeeksInYear(year)) { setWeek(1); setYear(y => y + 1) }
    else setWeek(w => w + 1)
  }

  const Row = ({ label, value, bold, indent, color }: any) => (
    <div className={`flex justify-between items-center py-1.5 border-b border-border/40 last:border-0 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm font-medium ${bold ? "font-bold" : ""} ${color ?? ""}`}>{value}</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bilan hebdomadaire</h1>
          <p className="text-sm text-muted-foreground mt-1">Résumé financier par semaine</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button
            variant={data?.alreadyDeclared ? "outline" : "default"}
            onClick={declareTax}
            disabled={declaring || !data || data?.alreadyDeclared}
          >
            {declaring ? <Loader2 className="h-4 w-4 animate-spin" /> : data?.alreadyDeclared ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Landmark className="h-4 w-4" />}
            {declaring ? "Déclaration..." : data?.alreadyDeclared ? "Déjà déclarée" : "Déclarer impôt"}
          </Button>
          {data?.alreadyDeclared && data?.declaration && (
            <Button
              variant="outline"
              onClick={() => downloadDeclarationReceipt({
                companyName: data.companyName, currency: data.currency,
                weekNumber: data.declaration.weekNumber, year: data.declaration.year,
                revenue: data.declaration.revenue, chargesDeductible: data.declaration.chargesDeductible,
                chargesNonDeductible: data.declaration.chargesNonDeductible, netProfit: data.declaration.netProfit,
                taxes: data.declaration.taxes, declaredAt: data.declaration.declaredAt, mairieZone: data.declaration.mairieZone,
              })}
            >
              <FileDown className="h-4 w-4" /> Reçu de déclaration
            </Button>
          )}
          <Button onClick={saveAndDownload} disabled={downloading || !data} variant="outline">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Génération..." : "Enregistrer & Télécharger"}
          </Button>
        </div>
      </div>
      {declareError && <p className="text-sm text-destructive -mt-3">{declareError}</p>}

      <div className="flex bg-muted rounded-lg p-1 gap-1 self-start w-fit">
        {(["bilan", "messages"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {v === "messages" && <MessageSquare className="h-3.5 w-3.5" />}
            {v === "bilan" ? "Bilan" : "Messages autorités"}
          </button>
        ))}
      </div>

      {view === "messages" && (
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Select value={chatRole} onValueChange={v => setChatRole(v as AuthorityRole)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IRS">{AUTHORITY_ROLE_LABELS.IRS}</SelectItem>
                {mairieRole && <SelectItem value={mairieRole}>{AUTHORITY_ROLE_LABELS[mairieRole]}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <AuthorityChatTab
            messagesUrl={`/api/authority-messages?role=${chatRole}`}
            sendUrl="/api/authority-messages"
            readUrl="/api/authority-messages/read"
            sendExtra={{ role: chatRole }}
            viewerIsAuthority={false}
            canSend
          />
        </div>
      )}

      {view === "bilan" && (
      <>
      {/* Week nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
          <span className="text-lg font-bold">S{String(week).padStart(2,"0")} {year}</span>
          {data && <span className="text-sm text-muted-foreground hidden sm:inline">· {data.weekStart} → {data.weekEnd}</span>}
        </div>
        <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "CA Total", value: fmt(data.revenue), color: "text-primary" },
              { label: "Salaires", value: fmt(data.totalSalaries), color: "text-amber-500" },
              { label: "Bénéfice Net", value: fmt(data.netProfit), color: (data.netProfit ?? 0) >= 0 ? "text-emerald-500" : "text-destructive" },
              { label: "Trésorerie", value: fmt(data.treasury), color: "text-primary" },
            ].map((s, i) => (
              <Card key={i}><CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
              </CardContent></Card>
            ))}
          </div>

          {/* Chart */}
          {data.dailyData && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Ventes par jour</CardTitle></CardHeader>
              <CardContent className="px-6 pb-4"><BarChart data={data.dailyData} currency={currency} height={130} /></CardContent>
            </Card>
          )}

          {/* Bilan columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><div className="flex justify-between items-center"><CardTitle className="text-sm">Compte de résultat</CardTitle><span className="text-base font-bold text-primary">{fmt(data.revenue)}</span></div></CardHeader>
              <CardContent className="pb-4 space-y-0">
                <Row label="CA total" value={fmt(data.revenue)} bold />
                <Row label="− Salaires" value={fmt(data.totalSalaries)} bold color="text-amber-500" />
                <Row label="Bénéfice après salaires" value={fmt(data.afterSalaries)} bold />
                <Row label="− Charges déductibles" value={fmt(data.chargesDeductible)} bold color="text-amber-500" />
                <Row label="Bénéfice brut" value={fmt(data.grossProfit)} bold />
                <Row label="Impôts" value={fmt(data.taxes)} indent color="text-destructive" />
                <Row label="Bénéfice net" value={fmt(data.netProfit)} bold color={(data.netProfit ?? 0) >= 0 ? "text-emerald-500" : "text-destructive"} />
                <Row label="Prime employés" value={fmt(data.bonusTotal)} indent color="text-amber-500" />
                <Row label="Dividendes" value={fmt(data.dividendTotal)} indent />
                <Row label="Trésorerie" value={fmt(data.treasury)} indent />
                <Row label="− Charges non déductibles" value={fmt(data.chargesNonDeductible)} indent color="text-destructive" />
                <Row label="Bénéfice final" value={fmt(data.finalProfit)} bold color={(data.finalProfit ?? 0) >= 0 ? "text-emerald-500" : "text-destructive"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><div className="flex justify-between items-center"><CardTitle className="text-sm">Charges</CardTitle><span className="text-base font-bold text-amber-500">{fmt((data.chargesDeductible ?? 0) + (data.chargesNonDeductible ?? 0))}</span></div></CardHeader>
              <CardContent className="pb-4 space-y-0">
                <Row label="Charges déductibles" value={fmt(data.chargesDeductible)} bold />
                <Row label="Coût de revient" value={fmt(data.costRevenue)} indent />
                <Row label="Salaires" value={fmt(data.totalSalaries)} indent />
                <Row label="Charges non déductibles" value={fmt(data.chargesNonDeductible)} bold />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><div className="flex justify-between items-center"><CardTitle className="text-sm">Ventes</CardTitle><span className="text-base font-bold text-emerald-500">{fmt(data.revenue)}</span></div></CardHeader>
              <CardContent className="pb-4 space-y-0">
                <Row label="Clients directs" value={fmt(data.clientRevenue)} bold />
                <Row label="Partenaires" value={fmt(data.partnerRevenue)} bold />
                {(data.partnerSummary ?? []).map((p: any, i: number) => <Row key={i} label={p.name} value={fmt(p.revenue)} indent />)}
              </CardContent>
            </Card>
          </div>

          {/* Employee table with dividends */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tableau employés — S{String(week).padStart(2,"0")} {year}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead><TableHead>Grade</TableHead><TableHead>RIB</TableHead>
                    <TableHead>CA brut</TableHead><TableHead>Coût</TableHead><TableHead>CA net</TableHead>
                    <TableHead>% Sal.</TableHead><TableHead>Salaire</TableHead>
                    <TableHead>% Div.</TableHead><TableHead>Dividende</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.employeeStats ?? []).map((emp: any) => (
                    <TableRow key={emp.employeeId}>
                      <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell><Badge variant="default">{emp.grade}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{emp.accountNumber ?? "—"}</TableCell>
                      <TableCell>{fmt(emp.revenue)}</TableCell>
                      <TableCell className="text-amber-500">−{fmt(emp.costRevenue)}</TableCell>
                      <TableCell className="font-bold text-primary">{fmt(emp.netRevenue)}</TableCell>
                      <TableCell><Badge variant="secondary">{emp.salaryPercent}%</Badge></TableCell>
                      <TableCell className="font-bold text-emerald-500">{fmt(emp.salary)}</TableCell>
                      <TableCell><Badge variant="outline">{emp.dividendPercent ?? 0}%</Badge></TableCell>
                      <TableCell className="font-bold text-primary">{fmt(emp.dividend ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell>{fmt((data.employeeStats ?? []).reduce((s: number, e: any) => s + e.revenue, 0))}</TableCell>
                    <TableCell className="text-amber-500">−{fmt((data.employeeStats ?? []).reduce((s: number, e: any) => s + e.costRevenue, 0))}</TableCell>
                    <TableCell className="text-primary">{fmt((data.employeeStats ?? []).reduce((s: number, e: any) => s + e.netRevenue, 0))}</TableCell>
                    <TableCell colSpan={1} />
                    <TableCell className="text-emerald-500">{fmt((data.employeeStats ?? []).reduce((s: number, e: any) => s + e.salary, 0))}</TableCell>
                    <TableCell colSpan={1} />
                    <TableCell className="text-primary">{fmt((data.employeeStats ?? []).reduce((s: number, e: any) => s + (e.dividend ?? 0), 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          {/* Partner invoices */}
          {(data.partnerSummary ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Factures partenariat</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Partenaire</TableHead><TableHead>Semaine</TableHead><TableHead>CA brut</TableHead><TableHead>Remise</TableHead><TableHead>Total facturé</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(data.partnerSummary ?? []).map((p: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">S{String(week).padStart(2,"0")}</TableCell>
                        <TableCell>{fmt(p.revenue + p.discount)}</TableCell>
                        <TableCell className="text-emerald-500">−{fmt(p.discount)}</TableCell>
                        <TableCell className="font-bold text-primary">{fmt(p.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
      </>
      )}
    </div>
  )
}
