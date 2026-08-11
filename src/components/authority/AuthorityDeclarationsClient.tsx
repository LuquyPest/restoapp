"use client"
import { useState, useMemo } from "react"
import { Search, Building2, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Declaration {
  id: string; companyName: string; currency: string; weekNumber: number; year: number
  revenue: number; chargesDeductible: number; chargesNonDeductible: number
  netProfit: number; taxes: number; declaredAt: string
}
interface Props { declarations: Declaration[] }

export default function AuthorityDeclarationsClient({ declarations }: Props) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() =>
    declarations.filter(d => d.companyName.toLowerCase().includes(search.toLowerCase())),
    [declarations, search]
  )

  const totalTaxes = filtered.reduce((s, d) => s + d.taxes, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Déclarations d'impôt</h1>
        <p className="text-sm text-muted-foreground mt-1">{declarations.length} déclaration{declarations.length !== 1 ? "s" : ""} reçue{declarations.length !== 1 ? "s" : ""}</p>
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Rechercher une entreprise..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Semaine</TableHead>
                <TableHead>CA</TableHead>
                <TableHead>Charges</TableHead>
                <TableHead>Bénéfice net</TableHead>
                <TableHead>Impôt</TableHead>
                <TableHead>Déclarée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune déclaration</TableCell></TableRow>
              ) : filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.companyName}</TableCell>
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
