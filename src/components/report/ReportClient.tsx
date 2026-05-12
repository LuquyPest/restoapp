"use client"
import { useState, useEffect, useCallback } from "react"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Save, Download, Award, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

interface EmployeeStat {
  employeeId: string; firstName: string; lastName: string
  grade: string; salaryPercent: number; accountNumber: string | null
  revenue: number; costRevenue: number; netRevenue: number; salary: number
}

interface PartnerStat { name: string; revenue: number; discount: number }

interface ReportData {
  weekNumber: number; year: number
  revenue: number; costRevenue: number; totalSalaries: number
  chargesDeductible: number; chargesNonDeductible: number
  afterSalaries: number; grossProfit: number; taxes: number; netProfit: number
  bonusTotal: number; afterBonus: number; dividendTotal: number; treasury: number; finalProfit: number
  clientRevenue: number; partnerRevenue: number
  taxRate: number; bonusRate: number; dividendRate: number
  employeeStats: EmployeeStat[]
  partnerSummary: PartnerStat[]
  savedDividend: number; savedTreasury: number
}

interface Props { currency: string; taxRate: number; bonusRate: number; dividendRate: number }

export default function ReportClient({ currency, taxRate: defaultTax, bonusRate: defaultBonus, dividendRate: defaultDividend }: Props) {
  const now = new Date()
  const [week, setWeek] = useState(getISOWeek(now))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedDividend, setSavedDividend] = useState("")
  const [savedTreasury, setSavedTreasury] = useState("")
  const fmt = (n: number) => formatCurrency(n, currency)
  const pct = (n: number) => `${n.toFixed(2)}%`

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/report?week=${week}&year=${year}`)
      const d: ReportData = await res.json()
      setData(d)
      setSavedDividend(String(d.savedDividend.toFixed(2)))
      setSavedTreasury(String(d.savedTreasury.toFixed(2)))
    } finally { setLoading(false) }
  }, [week, year])

  useEffect(() => { fetchReport() }, [fetchReport])

  async function save() {
    setSaving(true)
    await fetch("/api/report", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, year, savedDividend: parseFloat(savedDividend) || 0, savedTreasury: parseFloat(savedTreasury) || 0 }),
    })
    setSaving(false); fetchReport()
  }

  function prevWeek() { if (week === 1) { setWeek(52); setYear(y => y-1) } else setWeek(w => w-1) }
  function nextWeek() { if (week === 52) { setWeek(1); setYear(y => y+1) } else setWeek(w => w+1) }

  const BilanRow = ({ label, value, bold, indent, color, editable, editVal, onEdit }: any) => (
    <div className={`flex justify-between items-center py-1.5 border-b border-border/40 last:border-0 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      {editable ? (
        <Input type="number" min="0" step="0.01" className="w-32 h-7 text-xs text-right" value={editVal} onChange={e => onEdit(e.target.value)} />
      ) : (
        <span className={`text-sm font-medium ${bold ? "font-bold text-base" : ""} ${color ?? ""}`}>{value}</span>
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bilan hebdomadaire</h1>
          <p className="text-sm text-muted-foreground mt-1">Résumé financier — taux : impôts {pct(defaultTax)} · prime {pct(defaultBonus)} · dividende {pct(defaultDividend)}</p>
        </div>
        {data && (
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        )}
      </div>

      {/* Week selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5">
          <span className="text-xl font-bold">Bilan S{String(week).padStart(2,"0")} {year}</span>
        </div>
        <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Chargement...</div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "CA Total", value: fmt(data.revenue), color: "text-primary" },
              { label: "Salaires", value: fmt(data.totalSalaries), color: "text-amber-500" },
              { label: "Bénéfice Net", value: fmt(data.netProfit), color: data.netProfit >= 0 ? "text-emerald-500" : "text-destructive" },
              { label: "Trésorerie", value: fmt(parseFloat(savedTreasury) || data.treasury), color: "text-primary" },
            ].map((s, i) => (
              <Card key={i}><CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
              </CardContent></Card>
            ))}
          </div>

          {/* Bilan columns — Excel layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Col 1: Compte de résultat */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Chiffre d'affaires</CardTitle>
                  <span className="text-lg font-bold text-primary">{fmt(data.revenue)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-0 pb-4">
                <BilanRow label="Montant CA" value={fmt(data.revenue)} bold />
                <BilanRow label="Montant Salaire" value={fmt(data.totalSalaries)} bold color="text-amber-500" />
                <BilanRow label="Bénéfice après salaire" value={fmt(data.afterSalaries)} bold />
                <BilanRow label="Charges déductibles" value={fmt(data.chargesDeductible)} bold color="text-amber-500" />
                <BilanRow label="Bénéfices Brut" value={fmt(data.grossProfit)} bold />
                <BilanRow label={`A Payer impôts (${pct(data.taxRate)})`} value={fmt(data.taxes)} color="text-destructive" />
                <BilanRow label="Bénéfice Net" value={fmt(data.netProfit)} bold color={data.netProfit >= 0 ? "text-emerald-500" : "text-destructive"} />
                <BilanRow label={`Prime employé (${pct(data.bonusRate)})`} value={fmt(data.bonusTotal)} color="text-amber-500" />
                <BilanRow label="Bénéfice après Prime Employé" value={fmt(data.afterBonus)} bold />
                <BilanRow label={`Dividendes (${pct(data.dividendRate)})`} value={fmt(data.dividendTotal)} editable editVal={savedDividend} onEdit={setSavedDividend} />
                <BilanRow label="Trésorerie" value={fmt(data.treasury)} editable editVal={savedTreasury} onEdit={setSavedTreasury} />
                <BilanRow label="Charge non déductible" value={fmt(data.chargesNonDeductible)} color="text-destructive" />
                <BilanRow label="Bénéfice final" value={fmt(data.finalProfit)} bold color={data.finalProfit >= 0 ? "text-emerald-500" : "text-destructive"} />
              </CardContent>
            </Card>

            {/* Col 2: Charges */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Charges</CardTitle>
                  <span className="text-lg font-bold text-amber-500">{fmt(data.chargesDeductible + data.chargesNonDeductible)}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-0">
                <BilanRow label="Charges non déductibles" value={fmt(data.chargesNonDeductible)} bold />
                <BilanRow label="Charges déductibles" value={fmt(data.chargesDeductible)} bold />
                <BilanRow label="Coût de revient des ventes" value={fmt(data.costRevenue)} indent />
                <BilanRow label="Salaires employés" value={fmt(data.totalSalaries)} indent />
                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Partenaires cette semaine</p>
                  {data.partnerSummary.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune vente partenaire</p>
                  ) : data.partnerSummary.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="font-medium">{fmt(p.revenue)} <span className="text-emerald-500">(−{fmt(p.discount)})</span></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Col 3: Ventes */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Ventes</CardTitle>
                  <span className="text-lg font-bold text-emerald-500">{fmt(data.revenue)}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-0">
                <BilanRow label="Ventes aux clients" value={fmt(data.clientRevenue)} bold />
                <BilanRow label="Ventes aux partenaires" value={fmt(data.partnerRevenue)} bold />
              </CardContent>
            </Card>
          </div>

          {/* Tableau employés — comme Excel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Table Employés — Semaine {week}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé(e)</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>RIB</TableHead>
                    <TableHead>% CA</TableHead>
                    <TableHead>CA total</TableHead>
                    <TableHead>Coût revient</TableHead>
                    <TableHead>CA net</TableHead>
                    <TableHead>Salaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.employeeStats.filter(e => e.revenue > 0 || true).map(emp => (
                    <TableRow key={emp.employeeId}>
                      <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell><Badge variant="default">{emp.grade}</Badge></TableCell>
                      <TableCell>
                        {emp.accountNumber ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <CreditCard className="h-3 w-3" />{emp.accountNumber}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell><Badge variant="secondary">{emp.salaryPercent}%</Badge></TableCell>
                      <TableCell className={`font-medium ${emp.revenue === 0 ? "text-muted-foreground" : ""}`}>{fmt(emp.revenue)}</TableCell>
                      <TableCell className="text-amber-500">{emp.costRevenue > 0 ? `−${fmt(emp.costRevenue)}` : "—"}</TableCell>
                      <TableCell className="font-semibold text-primary">{fmt(emp.netRevenue)}</TableCell>
                      <TableCell className={`font-bold ${emp.salary > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>{fmt(emp.salary)}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-primary">{fmt(data.employeeStats.reduce((s,e) => s+e.revenue, 0))}</TableCell>
                    <TableCell className="text-amber-500">−{fmt(data.employeeStats.reduce((s,e) => s+e.costRevenue, 0))}</TableCell>
                    <TableCell className="text-primary">{fmt(data.employeeStats.reduce((s,e) => s+e.netRevenue, 0))}</TableCell>
                    <TableCell className="text-emerald-500">{fmt(data.employeeStats.reduce((s,e) => s+e.salary, 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Partner invoices */}
          {data.partnerSummary.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Factures Partenariat — Semaine {week}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partenaire</TableHead>
                      <TableHead>Semaine</TableHead>
                      <TableHead>CA brut</TableHead>
                      <TableHead>Remise</TableHead>
                      <TableHead>Facture Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.partnerSummary.map((p, i) => (
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
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
