"use client"
import { formatCurrency, getISOWeek, getISOWeeksInYear } from "@/lib/utils"
import { TrendingUp, ShoppingCart, Banknote, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EmployeeStat {
  id: string; firstName: string; lastName: string
  gradeName: string; salaryPercent: number
  revenue: number; costRevenue: number; netRevenue: number; salary: number; orderCount: number
}
interface Props {
  stats: EmployeeStat[]; currency: string
  selectedWeek: number; selectedYear: number
  currentWeek: number; currentYear: number
}

export default function SalesClient({ stats, currency, selectedWeek, selectedYear, currentWeek, currentYear }: Props) {
  const router = useRouter()
  const fmt = (n: number) => formatCurrency(n, currency)
  const clientNow = new Date()
  currentWeek = getISOWeek(clientNow)
  currentYear = clientNow.getFullYear()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("week")) {
      const cw = getISOWeek(new Date()); const cy = new Date().getFullYear()
      if (cw !== selectedWeek || cy !== selectedYear) router.replace(`/sales?week=${cw}&year=${cy}`)
    }
  }, [])

  const totals = {
    revenue: stats.reduce((s,e) => s+e.revenue, 0),
    cost: stats.reduce((s,e) => s+e.costRevenue, 0),
    salaries: stats.reduce((s,e) => s+e.salary, 0),
  }
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear

  function navigate(delta: number) {
    let w = selectedWeek + delta; let y = selectedYear
    if (w < 1) { y--; w = getISOWeeksInYear(y) }
    if (w > getISOWeeksInYear(y)) { w = 1; y++ }
    router.push(`/sales?week=${w}&year=${y}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Liste des ventes</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance de l'équipe</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2 text-sm font-bold">
            S{String(selectedWeek).padStart(2,"0")} {selectedYear}
            {isCurrentWeek && <Badge variant="default" className="text-[10px] px-1.5 ml-1">En cours</Badge>}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "CA total", value: fmt(totals.revenue), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Coût de revient", value: fmt(totals.cost), icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Salaires estimés", value: fmt(totals.salaries), icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employé</TableHead><TableHead>Grade</TableHead><TableHead>Commandes</TableHead>
              <TableHead>CA brut</TableHead><TableHead>Coût revient</TableHead><TableHead>CA net</TableHead>
              <TableHead>%</TableHead><TableHead>Salaire estimé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Aucune vente cette semaine</TableCell></TableRow>
            ) : stats.map(emp => (
              <TableRow key={emp.id}>
                <TableCell className="font-semibold">{emp.firstName} {emp.lastName}</TableCell>
                <TableCell><Badge variant="default" className="gap-1"><Award className="h-3 w-3" />{emp.gradeName}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{emp.orderCount}</TableCell>
                <TableCell className="font-medium">{fmt(emp.revenue)}</TableCell>
                <TableCell className="text-amber-500">−{fmt(emp.costRevenue)}</TableCell>
                <TableCell className="font-bold text-primary">{fmt(emp.netRevenue)}</TableCell>
                <TableCell><Badge variant="secondary">{emp.salaryPercent}%</Badge></TableCell>
                <TableCell className="font-bold text-emerald-500">{fmt(emp.salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  )
}
