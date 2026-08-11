"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/business-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import BarChart from "@/components/ui/BarChart"
import { cn } from "@/lib/utils"

interface Company { id: string; name: string; type: CompanyType; currency: string; mairieZone: "NORD" | "SUD" | null }
interface Declaration {
  id: string; weekNumber: number; year: number; revenue: number
  chargesDeductible: number; chargesNonDeductible: number; netProfit: number; taxes: number; declaredAt: string
}
interface Props { company: Company; declarations: Declaration[] }

const TABS = [
  { key: "declarations", label: "Déclarations" },
] as const
type TabKey = typeof TABS[number]["key"]

export default function AuthorityCompanyDetailClient({ company, declarations }: Props) {
  const [tab, setTab] = useState<TabKey>("declarations")
  const fmt = (n: number) => formatCurrency(n, company.currency)

  const trendData = [...declarations].reverse().slice(-12).map(d => ({
    label: `S${String(d.weekNumber).padStart(2, "0")}`,
    value: d.taxes,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/authority/companies"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Building2 className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{company.name}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="secondary" className="text-[10px]">{COMPANY_TYPE_LABELS[company.type]}</Badge>
            {company.mairieZone && <Badge variant="outline" className="text-[10px]">{company.mairieZone === "NORD" ? "Mairie Nord" : "Mairie Sud"}</Badge>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "declarations" && (
        <div className="space-y-4">
          {declarations.length === 0 ? (
            <Card className="p-10 text-center"><p className="text-muted-foreground">Aucune déclaration reçue</p></Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Évolution de l'impôt déclaré</p>
                  <BarChart data={trendData} currency={company.currency} />
                </CardContent>
              </Card>

              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Semaine</TableHead>
                        <TableHead>CA</TableHead>
                        <TableHead>Charges</TableHead>
                        <TableHead>Bénéfice net</TableHead>
                        <TableHead>Impôt</TableHead>
                        <TableHead>Déclarée le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {declarations.map(d => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] gap-1"><Calendar className="h-2.5 w-2.5" />S{String(d.weekNumber).padStart(2, "0")} {d.year}</Badge>
                          </TableCell>
                          <TableCell>{fmt(d.revenue)}</TableCell>
                          <TableCell>{fmt(d.chargesDeductible + d.chargesNonDeductible)}</TableCell>
                          <TableCell>{fmt(d.netProfit)}</TableCell>
                          <TableCell className="font-semibold text-primary">{fmt(d.taxes)}</TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(d.declaredAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
