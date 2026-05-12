"use client"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Product { name: string; category: string; qty: number; revenue: number; cost: number; margin: number }
export default function ProductSalesClient({ products, currency }: { products: Product[]; currency: string }) {
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalQty = products.reduce((s, p) => s + p.qty, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ventes par produit</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalQty} articles vendus · {fmt(totalRevenue)} de CA cette semaine</p>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Qté</TableHead><TableHead>CA</TableHead><TableHead>Coût</TableHead><TableHead>Marge</TableHead><TableHead>% CA</TableHead></TableRow></TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune vente</TableCell></TableRow>
            ) : products.map((p, i) => (
              <TableRow key={i}>
                <TableCell><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="h-3.5 w-3.5 text-primary" /></div><span className="font-semibold">{p.name}</span></div></TableCell>
                <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                <TableCell className="font-bold">{p.qty}</TableCell>
                <TableCell className="font-bold">{fmt(p.revenue)}</TableCell>
                <TableCell className="text-amber-500">−{fmt(p.cost)}</TableCell>
                <TableCell className={`font-bold ${p.margin >= 0 ? "text-emerald-500" : "text-destructive"}`}>{fmt(p.margin)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden max-w-20">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
