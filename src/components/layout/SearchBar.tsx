"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Users, UtensilsCrossed, FileText, ShoppingBag, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchResults {
  employees: { id: string; firstName: string; lastName: string }[]
  menuItems: { id: string; name: string; category: string; price: number }[]
  invoices: { id: string; reference: string | null; amount: number; status: string; supplier: { name: string } }[]
  orders: { id: string; total: number; createdAt: string; employee: { firstName: string; lastName: string } | null }[]
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: SearchResults = await res.json()
        const hasResults = data.employees.length + data.menuItems.length + data.invoices.length + data.orders.length > 0
        setResults(data)
        setOpen(hasResults)
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function clear() { setQuery(""); setResults(null); setOpen(false); inputRef.current?.focus() }

  function navigate(href: string) { setOpen(false); setQuery(""); setResults(null); router.push(href) }

  const total = results ? results.employees.length + results.menuItems.length + results.invoices.length + results.orders.length : 0

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className={cn("absolute left-3 h-4 w-4 pointer-events-none transition-colors", loading ? "text-primary animate-pulse" : "text-muted-foreground")} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher employé, article, facture, commande…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results && total > 0) setOpen(true) }}
          className="w-full h-9 pl-9 pr-8 rounded-lg border bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results && (
        <div className="absolute top-11 left-0 right-0 rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
          {results.employees.length > 0 && (
            <Section icon={<Users className="h-3 w-3" />} label="Employés">
              {results.employees.map(e => (
                <ResultItem key={e.id} onClick={() => navigate("/employees")}>
                  {e.firstName} {e.lastName}
                </ResultItem>
              ))}
            </Section>
          )}
          {results.menuItems.length > 0 && (
            <Section icon={<UtensilsCrossed className="h-3 w-3" />} label="Articles">
              {results.menuItems.map(i => (
                <ResultItem key={i.id} onClick={() => navigate("/menu")} sub={i.category}>
                  {i.name}
                </ResultItem>
              ))}
            </Section>
          )}
          {results.invoices.length > 0 && (
            <Section icon={<FileText className="h-3 w-3" />} label="Factures">
              {results.invoices.map(i => (
                <ResultItem key={i.id} onClick={() => navigate("/invoices")} sub={i.supplier.name}>
                  {i.reference ?? `Facture #${i.id.slice(-6)}`}
                </ResultItem>
              ))}
            </Section>
          )}
          {results.orders.length > 0 && (
            <Section icon={<ShoppingBag className="h-3 w-3" />} label="Commandes">
              {results.orders.map(o => (
                <ResultItem key={o.id} onClick={() => navigate("/orders")} sub={o.employee ? `${o.employee.firstName} ${o.employee.lastName}` : "—"}>
                  Commande #{o.id.slice(-6)}
                </ResultItem>
              ))}
            </Section>
          )}
          {total === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun résultat pour "{query}"</div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b bg-muted/30">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  )
}

function ResultItem({ children, sub, onClick }: { children: React.ReactNode; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-left gap-4">
      <span className="text-sm font-medium truncate">{children}</span>
      {sub && <span className="text-xs text-muted-foreground shrink-0">{sub}</span>}
    </button>
  )
}
