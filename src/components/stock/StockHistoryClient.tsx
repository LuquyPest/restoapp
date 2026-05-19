"use client"
import { useState, useMemo, useEffect } from "react"
import { ArrowLeft, Search, ChevronDown, ChevronRight, Package, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"

interface DeductionEntry {
  id: string
  createdAt: string
  employeeName: string
  total: number
  weekNumber: number
  year: number
  items: { name: string; quantity: number }[]
  deductions: { name: string; quantity: number }[]
}

interface Props { history: DeductionEntry[] }

export default function StockHistoryClient({ history }: Props) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(10)

  useEffect(() => { setVisibleCount(10) }, [search])

  const filtered = useMemo(() => {
    if (!search.trim()) return history
    const q = search.toLowerCase()
    return history.filter(entry =>
      entry.employeeName.toLowerCase().includes(q) ||
      entry.deductions.some(d => d.name.toLowerCase().includes(q)) ||
      entry.items.some(i => i.name.toLowerCase().includes(q))
    )
  }, [history, search])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/stock"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Historique du stock</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} commande{filtered.length !== 1 ? "s" : ""} avec impact stock
              {visibleCount < filtered.length && ` · ${visibleCount} affichées`}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Rechercher par ingrédient, article ou employé..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {history.length === 0
              ? "Aucune commande avec déduction de stock pour l'instant"
              : "Aucun résultat pour cette recherche"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, visibleCount).map(entry => {
            const isOpen = expanded.has(entry.id)
            return (
              <Card key={entry.id} className="overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                  onClick={() => toggle(entry.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.employeeName} · S{String(entry.weekNumber).padStart(2, "0")} {entry.year}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {entry.deductions.length} ingrédient{entry.deductions.length !== 1 ? "s" : ""}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      {formatDateTime(new Date(entry.createdAt))}
                    </span>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isOpen && (
                  <CardContent className="px-4 pb-4 pt-0 border-t bg-muted/20">
                    <div className="grid sm:grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Articles commandés</p>
                        <div className="space-y-1">
                          {entry.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">× {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Stock déduit</p>
                        <div className="space-y-1">
                          {entry.deductions.map((d, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{d.name}</span>
                              <span className="text-destructive font-medium">−{d.quantity % 1 === 0 ? d.quantity : d.quantity.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
          {visibleCount < filtered.length && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisibleCount(v => v + 10)}>
                Afficher plus ({filtered.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
