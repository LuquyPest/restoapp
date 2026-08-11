"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Building2, Calendar, ArrowUpDown, ClipboardList } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Declaration {
  id: string; companyId: string; companyName: string; currency: string; weekNumber: number; year: number
  revenue: number; chargesDeductible: number; chargesNonDeductible: number
  netProfit: number; taxes: number; declaredAt: string
}
interface Props { declarations: Declaration[] }

type SortKey = "companyName" | "week" | "revenue" | "taxes" | "declaredAt"

export default function AuthorityDeclarationsClient({ declarations }: Props) {
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

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead>
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}<ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </TableHead>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Déclarations d'impôt</h1>
          <p className="text-sm text-muted-foreground mt-1">{declarations.length} déclaration{declarations.length !== 1 ? "s" : ""} reçue{declarations.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" asChild><Link href="/authority/companies"><ClipboardList className="h-4 w-4" /> Registre des entreprises</Link></Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune déclaration</TableCell></TableRow>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
