"use client"
import { formatCurrency, formatDateTime, getISOWeek, getISOWeeksInYear } from "@/lib/utils"
import { TrendingUp, TrendingDown, Users, ShoppingCart, FileText, Banknote, CheckCircle, Clock, AlertCircle, ArrowUpRight, ChevronLeft, ChevronRight, Minus, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import BarChart from "@/components/ui/BarChart"

interface DayData { label: string; value: number }
interface RecentOrder {
  id: string; total: number; status: string; createdAt: Date
  employee: { firstName: string; lastName: string } | null
  lines: { quantity: number; menuItem: { name: string } }[]
}
interface TopItem { name: string; quantity: number }
interface Props {
  weekRevenue: number; totalCharges: number; benefit: number
  totalEmployees: number; pendingInvoices: number; weekOrderCount: number; prevWeekOrderCount: number
  recentOrders: RecentOrder[]; currency: string
  dailyData: DayData[]; weeklyTrend: DayData[]; topItems: TopItem[]
  selectedWeek: number; selectedYear: number
  currentWeek: number; currentYear: number
}

export default function OwnerDashboard({ weekRevenue, totalCharges, benefit, totalEmployees, pendingInvoices, weekOrderCount, prevWeekOrderCount, recentOrders, currency, dailyData, weeklyTrend, topItems, selectedWeek, selectedYear, currentWeek, currentYear }: Props) {
  const router = useRouter()
  const fmt = (n: number) => formatCurrency(n, currency)
  const clientNow = new Date()
  currentWeek = getISOWeek(clientNow)
  currentYear = clientNow.getFullYear()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("week")) {
      const cw = getISOWeek(new Date()); const cy = new Date().getFullYear()
      if (cw !== selectedWeek || cy !== selectedYear) router.replace(`/dashboard?week=${cw}&year=${cy}`)
    }
  }, [])

  function navigate(delta: number) {
    let w = selectedWeek + delta
    let y = selectedYear
    if (w < 1) { y--; w = getISOWeeksInYear(y) }
    if (w > getISOWeeksInYear(y)) { w = 1; y++ }
    router.push(`/dashboard?week=${w}&year=${y}`)
  }

  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear

  const orderDelta = weekOrderCount - prevWeekOrderCount
  const OrderDeltaIcon = orderDelta > 0 ? TrendingUp : orderDelta < 0 ? TrendingDown : Minus
  const orderDeltaColor = orderDelta > 0 ? "text-emerald-500" : orderDelta < 0 ? "text-destructive" : "text-muted-foreground"
  const orderDeltaBg = orderDelta > 0 ? "bg-emerald-500/10" : orderDelta < 0 ? "bg-destructive/10" : "bg-muted/40"

  const stats = [
    { label: "CA semaine", value: fmt(weekRevenue), sub: `${weekOrderCount} commandes`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    {
      label: "Commandes vs S-1",
      value: `${orderDelta > 0 ? "+" : ""}${orderDelta}`,
      sub: `${weekOrderCount} cette sem. · ${prevWeekOrderCount} sem. préc.`,
      icon: OrderDeltaIcon,
      color: orderDeltaColor,
      bg: orderDeltaBg,
    },
    { label: "Charges semaine", value: fmt(totalCharges), sub: "Payes + taxes", icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Bénéfice semaine", value: fmt(benefit), sub: "CA semaine − charges", icon: TrendingUp, color: benefit >= 0 ? "text-emerald-500" : "text-destructive", bg: benefit >= 0 ? "bg-emerald-500/10" : "bg-destructive/10" },
  ]

  const statusIcon = (s: string) => {
    if (s === "CONFIRMED") return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
    if (s === "CANCELLED") return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
    return <Clock className="h-3.5 w-3.5 text-amber-500" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre établissement</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
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
          <CardTitle className="text-sm">Ventes par jour — S{String(selectedWeek).padStart(2,"0")} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <BarChart data={dailyData} currency={currency} height={140} />
        </CardContent>
      </Card>

      {/* 8-week trend + top items */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CA — 8 dernières semaines</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <BarChart data={weeklyTrend} currency={currency} height={140} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
            <Trophy className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm">Top articles du mois</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {topItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Aucune vente ce mois-ci</p>
            ) : (
              <div className="space-y-2">
                {topItems.map((item, i) => {
                  const max = topItems[0].quantity
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <span className={`shrink-0 font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                          {item.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground ml-2">{item.quantity}×</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${(item.quantity / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/employees">
          <Card className="hover:border-border/80 transition-colors cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0"><Users className="h-5 w-5 text-primary" /></div>
              <div className="flex-1"><p className="text-xl font-bold">{totalEmployees}</p><p className="text-sm text-muted-foreground">Employés actifs</p></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/invoices">
          <Card className="hover:border-border/80 transition-colors cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${pendingInvoices > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                <FileText className={`h-5 w-5 ${pendingInvoices > 0 ? "text-amber-500" : "text-emerald-500"}`} />
              </div>
              <div className="flex-1"><p className="text-xl font-bold">{pendingInvoices}</p><p className="text-sm text-muted-foreground">Factures en attente</p></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>Dernières commandes</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link href="/orders">Voir tout →</Link></Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Aucune commande</div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40 transition-colors">
                  <div className="h-7 w-7 flex items-center justify-center rounded-full bg-muted shrink-0">{statusIcon(order.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.lines.map(l => `${l.quantity}× ${l.menuItem.name}`).join(", ")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{fmt(order.total)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
