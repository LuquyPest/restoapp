"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Building2, Calendar, ArrowUpDown, ClipboardList, Download, FileDown } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BarChart from "@/components/ui/BarChart"
import { downloadCSV } from "@/lib/csv-export"
import { downloadDeclarationReceipt } from "@/lib/declaration-receipt"

interface Declaration {
  id: string; companyId: string; companyName: string; currency: string; weekNumber: number; year: number
  revenue: number; chargesDeductible: number; chargesNonDeductible: number
  netProfit: number; taxes: number; declaredAt: string; mairieZone: "NORD" | "SUD" | null
}
interface Props { declarations: Declaration[]; isIRS: boolean }

type SortKey = "companyName" | "week" | "revenue" | "taxes" | "declaredAt"

export default function AuthorityDeclarationsClient({ declarations, isIRS }: Props) {
  const [search, setSearch] = useState("")
  const [year, setYear] = useState("all")
  const [minTaxes, setMinTaxes] = useState("")
  const [maxTaxes, setMaxTaxes] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("declaredAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const years = useMemo(() => [...new Set(declarations.map(d => d.year))].sort((a, b) => b - a), [declarations])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const filtered = useMemo(() => {
    const min = parseFloat(minTaxes)
    const max = parseFloat(maxTaxes)
    let list = declarations.filter(d => {
      if (!d.companyName.toLowerCase().includes(search.toLowerCase())) return false
      if (year !== "all" && d.year !== parseInt(year)) return false
      if (!isNaN(min) && d.taxes < min) return false
      if (!isNaN(max) && d.taxes > max) return false
      return true
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "companyName") cmp = a.companyName.localeCompare(b.companyName)
      else if (sortKey === "week") cmp = (a.year * 100 + a.weekNumber) - (b.year * 100 + b.weekNumber)
      else if (sortKey === "revenue") cmp = a.revenue - b.revenue
      else if (sortKey === "taxes") cmp = a.taxes - b.taxes
      else cmp = new Date(a.declaredAt).getTime() - new Date(b.declaredAt).getTime()
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [declarations, search, year, minTaxes, maxTaxes, sortKey, sortDir])

  const totalTaxes = filtered.reduce((s, d) => s + d.taxes, 0)

  const weeklyTrend = useMemo(() => {
    const map = new Map<string, { key: number; label: string; value: number }>()
    for (const d of declarations) {
      const key = d.year * 100 + d.weekNumber
      const label = `S${String(d.weekNumber).padStart(2, "0")}`
      const ex = map.get(String(key)) ?? { key, label, value: 0 }
      ex.value += d.taxes
      map.set(String(key), ex)
    }
    return Array.from(map.values()).sort((a, b) => a.key - b.key).slice(-12)
  }, [declarations])

  const zoneTrend = useMemo(() => {
    if (!isIRS) return null
    function trendFor(zone: "NORD" | "SUD") {
      const map = new Map<string, { key: number; label: string; value: number }>()
      for (const d of declarations.filter(x => x.mairieZone === zone)) {
        const key = d.year * 100 + d.weekNumber
        const label = `S${String(d.weekNumber).padStart(2, "0")}`
        const ex = map.get(String(key)) ?? { key, label, value: 0 }
        ex.value += d.taxes
        map.set(String(key), ex)
      }
      return Array.from(map.values()).sort((a, b) => a.key - b.key).slice(-12)
    }
    return { nord: trendFor("NORD"), sud: trendFor("SUD") }
  }, [declarations, isIRS])

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead>
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}<ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </TableHead>
  )

  function exportCSV() {
    downloadCSV(
      `declarations-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Entreprise", "Semaine", "Année", "CA", "Charges déductibles", "Charges non déductibles", "Bénéfice net", "Impôt", "Déclarée le"],
      filtered.map(d => [d.companyName, d.weekNumber, d.year, d.revenue, d.chargesDeductible, d.chargesNonDeductible, d.netProfit, d.taxes, formatDate(d.declaredAt)])
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Déclarations d'impôt</h1>
          <p className="text-sm text-muted-foreground mt-1">{declarations.length} déclaration{declarations.length !== 1 ? "s" : ""} reçue{declarations.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}><FileDown className="h-4 w-4" /> Exporter CSV</Button>
          <Button variant="outline" asChild><Link href="/authority/companies"><ClipboardList className="h-4 w-4" /> Registre des entreprises</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Entreprises distinctes</p>
          <p className="text-3xl font-bold text-primary">{new Set(filtered.map(d => d.companyName)).size}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Total impôt déclaré</p>
          <p className="text-3xl font-bold">{formatCurrency(totalTaxes, filtered[0]?.currency ?? "$")}</p>
        </CardContent></Card>
      </div>

      {weeklyTrend.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Évolution de l'impôt déclaré (toutes entreprises)</p>
            <BarChart data={weeklyTrend} currency={declarations[0]?.currency ?? "$"} />
          </CardContent>
        </Card>
      )}

      {zoneTrend && (zoneTrend.nord.length > 0 || zoneTrend.sud.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mairie Nord</p>
            <BarChart data={zoneTrend.nord} currency={declarations[0]?.currency ?? "$"} color="hsl(210 80% 60%)" />
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mairie Sud</p>
            <BarChart data={zoneTrend.sud} currency={declarations[0]?.currency ?? "$"} color="hsl(25 80% 60%)" />
          </CardContent></Card>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Rechercher une entreprise..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes années</SelectItem>
            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="space-y-1">
          <Input type="number" placeholder="Impôt min" className="w-28 h-9 text-xs" value={minTaxes} onChange={e => setMinTaxes(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Input type="number" placeholder="Impôt max" className="w-28 h-9 text-xs" value={maxTaxes} onChange={e => setMaxTaxes(e.target.value)} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Entreprise" k="companyName" />
                <SortHead label="Semaine" k="week" />
                <SortHead label="CA" k="revenue" />
                <TableHead>Charges</TableHead>
                <TableHead>Bénéfice net</TableHead>
                <SortHead label="Impôt" k="taxes" />
                <SortHead label="Déclarée le" k="declaredAt" />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Aucune déclaration</TableCell></TableRow>
              ) : filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    <Link href={`/authority/companies/${d.companyId}`} className="hover:text-primary hover:underline">{d.companyName}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] gap-1"><Calendar className="h-2.5 w-2.5" />S{String(d.weekNumber).padStart(2, "0")} {d.year}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(d.revenue, d.currency)}</TableCell>
                  <TableCell>{formatCurrency(d.chargesDeductible + d.chargesNonDeductible, d.currency)}</TableCell>
                  <TableCell>{formatCurrency(d.netProfit, d.currency)}</TableCell>
                  <TableCell className="font-semibold text-primary">{formatCurrency(d.taxes, d.currency)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(d.declaredAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Télécharger le reçu" onClick={() => downloadDeclarationReceipt(d)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
