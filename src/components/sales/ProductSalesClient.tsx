"use client"
import { formatCurrency, getISOWeek, getISOWeeksInYear } from "@/lib/utils"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Product { name: string; category: string; qty: number; revenue: number; cost: number; margin: number }
interface Props {
  products: Product[]; currency: string
  selectedWeek: number; selectedYear: number
  currentWeek: number; currentYear: number
}

export default function ProductSalesClient({ products, currency, selectedWeek, selectedYear, currentWeek, currentYear }: Props) {
  const router = useRouter()
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalQty = products.reduce((s, p) => s + p.qty, 0)
  const clientNow = new Date()
  currentWeek = getISOWeek(clientNow)
  currentYear = clientNow.getFullYear()
  const isCurrentWeek = selectedWeek === currentWeek && selectedYear === currentYear

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("week")) {
      const cw = getISOWeek(new Date()); const cy = new Date().getFullYear()
      if (cw !== selectedWeek || cy !== selectedYear) router.replace(`/sales/products?week=${cw}&year=${cy}`)
    }
  }, [])

  function navigate(delta: number) {
    let w = selectedWeek + delta; let y = selectedYear
    if (w < 1) { y--; w = getISOWeeksInYear(y) }
    if (w > getISOWeeksInYear(y)) { w = 1; y++ }
    router.push(`/sales/products?week=${w}&year=${y}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventes par produit</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalQty} articles · {fmt(totalRevenue)} de CA</p>
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

      <Card>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Qté</TableHead>
              <TableHead>CA</TableHead><TableHead>Coût</TableHead><TableHead>Marge</TableHead><TableHead>% CA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune vente cette semaine</TableCell></TableRow>
            ) : products.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="h-3.5 w-3.5 text-primary" /></div>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                <TableCell className="font-bold">{p.qty}</TableCell>
                <TableCell className="font-bold">{fmt(p.revenue)}</TableCell>
                <TableCell className="text-amber-500">−{fmt(p.cost)}</TableCell>
                <TableCell className={`font-bold ${p.margin >= 0 ? "text-emerald-500" : "text-destructive"}`}>{fmt(p.margin)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden max-w-20">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${totalRevenue > 0 ? (p.revenue/totalRevenue)*100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{totalRevenue > 0 ? ((p.revenue/totalRevenue)*100).toFixed(1) : 0}%</span>
                  </div>
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
