"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, ArrowLeft, AlertTriangle, Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/business-types"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CompanyRow {
  id: string; name: string; type: CompanyType; mairieZone: "NORD" | "SUD" | null; currency: string
  declaredCount: number; lastDeclaredAt: string | null; missingWeeks: number
}
interface Props { companies: CompanyRow[]; showZone: boolean }

export default function AuthorityCompaniesClient({ companies, showZone }: Props) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() =>
    companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [companies, search]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/authority"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registre des entreprises</h1>
          <p className="text-sm text-muted-foreground mt-1">{companies.length} entreprise{companies.length !== 1 ? "s" : ""} dans votre périmètre</p>
        </div>
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
                <TableHead>Type</TableHead>
                {showZone && <TableHead>Mairie</TableHead>}
                <TableHead>Déclarations</TableHead>
                <TableHead>Dernière déclaration</TableHead>
                <TableHead>Conformité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={showZone ? 6 : 5} className="text-center py-10 text-muted-foreground">Aucune entreprise</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/authority/companies/${c.id}`} className="flex items-center gap-2 hover:text-primary hover:underline">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />{c.name}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{COMPANY_TYPE_LABELS[c.type]}</Badge></TableCell>
                  {showZone && <TableCell className="text-sm text-muted-foreground">{c.mairieZone === "NORD" ? "Mairie Nord" : c.mairieZone === "SUD" ? "Mairie Sud" : "—"}</TableCell>}
                  <TableCell>{c.declaredCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.lastDeclaredAt ? formatDate(c.lastDeclaredAt) : "Jamais"}</TableCell>
                  <TableCell>
                    {c.missingWeeks > 0 ? (
                      <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="h-2.5 w-2.5" />{c.missingWeeks} semaine{c.missingWeeks !== 1 ? "s" : ""} non déclarée{c.missingWeeks !== 1 ? "s" : ""}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">À jour</Badge>
                    )}
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
