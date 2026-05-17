"use client"
import { formatCurrency, getISOWeeksInYear } from "@/lib/utils"
import { TrendingUp, ShoppingCart, Banknote, Award, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import BarChart from "@/components/ui/BarChart"

interface DayData { label: string; value: number }
interface Props {
  employee: { firstName: string; lastName: string; grade: { name: string; salaryPercent: number } }
  weekRevenue: number; monthRevenue: number; weekSalary: number; monthSalary: number
  currency: string; weekOrderCount: number; monthOrderCount: number
  dailyData: DayData[]; selectedWeek: number; selectedYear: number
  currentWeek: number; currentYear: number
}

export default function EmployeeDashboard({ employee, weekRevenue, monthRevenue, weekSalary, monthSalary, currency, weekOrderCount, monthOrderCount, dailyData, selectedWeek, selectedYear, currentWeek, currentYear }: Props) {
  const router = useRouter()
  const fmt = (n: number) => formatCurrency(n, currency)
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear

  function navigate(delta: number) {
    let w = selectedWeek + delta
    let y = selectedYear
    if (w < 1) { y--; w = getISOWeeksInYear(y) }
    if (w > getISOWeeksInYear(y)) { w = 1; y++ }
    router.push(`/dashboard?week=${w}&year=${y}`)
  }

  const stats = [
    { label: "CA cette semaine", value: fmt(weekRevenue), sub: `${weekOrderCount} commandes`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Salaire estimé sem.", value: fmt(weekSalary), sub: `${employee.grade.salaryPercent}% du CA net`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "CA ce mois", value: fmt(monthRevenue), sub: `${monthOrderCount} commandes`, icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Salaire estimé mois", value: fmt(monthSalary), sub: `${employee.grade.salaryPercent}% du CA net`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour, {employee.firstName} 👋</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="gap-1"><Award className="h-3 w-3" />{employee.grade.name}</Badge>
            <span className="text-sm text-muted-foreground">{employee.grade.salaryPercent}% de commission sur CA net</span>
          </div>
        </div>
        {/* Week selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold">
            S{String(selectedWeek).padStart(2,"0")} {selectedYear}
            {isCurrentWeek && <Badge variant="default" className="text-[10px] px-1.5 ml-1">En cours</Badge>}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              </div>
              <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Mes ventes par jour — S{String(selectedWeek).padStart(2,"0")} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <BarChart data={dailyData} currency={currency} height={130} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-4">Actions rapides</p>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild className="h-10"><Link href="/orders">Nouvelle commande</Link></Button>
            <Button variant="outline" asChild className="h-10"><Link href="/payroll">Mes payes</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
