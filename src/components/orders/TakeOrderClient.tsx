"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Minus, ShoppingCart, Trash2, Search, ImageIcon, Tag, CreditCard, Timer, UserCheck, Play, CheckCircle2, XCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MenuItem { id: string; name: string; price: number; costPrice: number; category: string; imageUrl: string | null }
interface Partner { id: string; name: string; discountPercent: number }
interface LoyaltyCard { id: string; firstName: string; lastName: string; discountPercent: number; expiresAt: Date }
interface CartItem { item: MenuItem; qty: number }
interface EmployeeRef { id: string; firstName: string; lastName: string }
interface Ticket {
  id: string; orderNumber: number | null; customerName: string | null; total: number
  status: "NEW" | "CLAIMED" | "IN_PROGRESS"; createdAt: string; note: string | null
  employee: EmployeeRef | null; claimedBy: EmployeeRef | null; closedBy: EmployeeRef | null
  claimedAt: string | null
  lines: { quantity: number; unitPrice: number; menuItem: { name: string } }[]
  partner: Partner | null; loyaltyCard: { firstName: string; lastName: string } | null
}
interface Props { menuItems: MenuItem[]; partners: Partner[]; loyaltyCards: LoyaltyCard[]; currency: string }

const POLL_INTERVAL = 4000
const COLUMNS: { status: Ticket["status"]; label: string }[] = [
  { status: "NEW", label: "Nouvelle" },
  { status: "CLAIMED", label: "Prise en charge" },
  { status: "IN_PROGRESS", label: "En cours" },
]

export default function TakeOrderClient({ menuItems, partners, loyaltyCards, currency }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [modal, setModal] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [customerName, setCustomerName] = useState("")
  const [note, setNote] = useState("")
  const [selectedPartnerId, setSelectedPartnerId] = useState("")
  const [selectedLoyaltyId, setSelectedLoyaltyId] = useState("")
  const [adjSign, setAdjSign] = useState<"plus" | "minus">("minus")
  const [adjType, setAdjType] = useState<"PERCENT" | "FIXED">("PERCENT")
  const [adjValue, setAdjValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fmt = (n: number) => formatCurrency(n, currency)
  const categories = useMemo(() => ["Tous", ...new Set(menuItems.map(m => m.category))], [menuItems])
  const filtered = useMemo(() => menuItems.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeCategory === "Tous" || m.category === activeCategory)
  ), [menuItems, search, activeCategory])

  const selectedPartner = partners.find(p => p.id === selectedPartnerId) ?? null
  const selectedLoyalty = loyaltyCards.find(c => c.id === selectedLoyaltyId) ?? null
  const partnerDiscount = selectedPartner?.discountPercent ?? 0
  const loyaltyDiscount = selectedLoyalty?.discountPercent ?? 0
  const discountPercent = Math.max(partnerDiscount, loyaltyDiscount)
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const adjRawValue = parseFloat(adjValue) || 0
  const adjSignedValue = adjSign === "minus" ? -adjRawValue : adjRawValue
  const customAdjustmentAmount = adjRawValue > 0
    ? adjType === "PERCENT" ? afterDiscount * (adjSignedValue / 100) : adjSignedValue
    : 0
  const total = Math.max(0, afterDiscount + customAdjustmentAmount)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const fetchTickets = useCallback(async (silent = false) => {
    const res = await fetch("/api/tickets")
    if (res.ok) setTickets(await res.json())
  }, [])

  useEffect(() => {
    fetchTickets()
    const id = setInterval(() => fetchTickets(true), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchTickets])

  function addToCart(item: MenuItem) {
    setCart(prev => { const ex = prev.find(c => c.item.id === item.id); if (ex) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c); return [...prev, { item, qty: 1 }] })
  }
  function updateQty(id: string, delta: number) { setCart(prev => prev.map(c => c.item.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0)) }

  function resetForm() {
    setCart([]); setCustomerName(""); setNote(""); setSelectedPartnerId(""); setSelectedLoyaltyId(""); setAdjValue(""); setError("")
  }

  async function createTicket() {
    if (cart.length === 0) return
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: cart.map(c => ({ menuItemId: c.item.id, quantity: c.qty })),
          customerName: customerName || undefined,
          note: note || undefined,
          partnerId: selectedPartnerId || null,
          loyaltyCardId: selectedLoyaltyId || null,
          customAdjustmentType: adjRawValue > 0 ? adjType : null,
          customAdjustmentValue: adjRawValue > 0 ? adjSignedValue : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      resetForm(); setModal(false); fetchTickets()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function doAction(ticketId: string, action: "claim" | "start" | "complete" | "cancel") {
    setActionLoading(ticketId)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/${action}`, { method: "PATCH" })
      if (res.ok) fetchTickets()
    } finally { setActionLoading(null) }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prendre une commande</h1>
          <p className="text-sm text-muted-foreground mt-1">{tickets.length} commande{tickets.length !== 1 ? "s" : ""} en cours</p>
        </div>
        <Button onClick={() => { resetForm(); setModal(true) }}><Plus className="h-4 w-4" /> Nouvelle commande</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map(col => {
          const colTickets = tickets.filter(t => t.status === col.status)
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.label}</p>
                <Badge variant="secondary" className="text-[10px]">{colTickets.length}</Badge>
              </div>
              <div className="space-y-3">
                {colTickets.length === 0 && (
                  <Card className="p-6 text-center"><p className="text-xs text-muted-foreground">Aucune commande</p></Card>
                )}
                {colTickets.map(t => (
                  <Card key={t.id}>
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold">Commande {t.orderNumber ? `#${t.orderNumber}` : ""}</p>
                          {t.customerName && <p className="text-xs text-muted-foreground">{t.customerName}</p>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />{formatTime(t.createdAt)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{t.lines.map(l => `${l.quantity}× ${l.menuItem.name}`).join(", ")}</p>
                      <p className="text-sm font-semibold text-primary">{fmt(t.total)}</p>
                      {t.claimedBy && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserCheck className="h-3 w-3" />Pris par {t.claimedBy.firstName} {t.claimedBy.lastName}
                          {t.claimedAt && ` à ${formatTime(t.claimedAt)}`}
                        </div>
                      )}
                      <div className="flex gap-1.5 pt-1">
                        {t.status === "NEW" && (
                          <Button size="sm" className="flex-1 h-8 text-xs" disabled={actionLoading === t.id} onClick={() => doAction(t.id, "claim")}>
                            <Timer className="h-3.5 w-3.5" /> Prendre la commande
                          </Button>
                        )}
                        {t.status === "CLAIMED" && (
                          <Button size="sm" className="flex-1 h-8 text-xs" disabled={actionLoading === t.id} onClick={() => doAction(t.id, "start")}>
                            <Play className="h-3.5 w-3.5" /> Démarrer
                          </Button>
                        )}
                        {t.status === "IN_PROGRESS" && (
                          <Button size="sm" variant="success" className="flex-1 h-8 text-xs" disabled={actionLoading === t.id} onClick={() => doAction(t.id, "complete")}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Terminer
                          </Button>
                        )}
                        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive" disabled={actionLoading === t.id} onClick={() => doAction(t.id, "cancel")}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Nom du client (optionnel)</Label><Input placeholder="Table 5, M. Dupont..." value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map(item => {
                  const inCart = cart.find(c => c.item.id === item.id)
                  return (
                    <Card key={item.id} className="overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:-translate-y-0.5" onClick={() => addToCart(item)}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-20 w-full object-contain bg-muted p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                      ) : (
                        <div className="h-16 bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                      <CardContent className="p-2.5">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-primary">{fmt(item.price)}</span>
                          {inCart && <Badge variant="default" className="text-[10px] px-1.5">×{inCart.qty}</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {filtered.length === 0 && <div className="col-span-full py-6 text-center text-xs text-muted-foreground">Aucun article</div>}
              </div>
            </div>

            <Card className="lg:sticky lg:top-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" />Panier</span>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" onClick={() => setCart([])}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">Cliquez sur un article</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {cart.map(c => (
                        <div key={c.item.id} className="flex items-center gap-1.5">
                          <p className="flex-1 text-xs font-medium truncate">{c.item.name}</p>
                          <Button variant="outline" size="icon" className="h-6 w-6 shrink-0" onClick={() => updateQty(c.item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-5 text-center text-sm font-semibold">{c.qty}</span>
                          <Button size="icon" className="h-6 w-6 shrink-0" onClick={() => updateQty(c.item.id, 1)}><Plus className="h-3 w-3" /></Button>
                          <span className="w-16 text-right text-sm font-semibold">{fmt(c.item.price * c.qty)}</span>
                        </div>
                      ))}
                    </div>

                    {partners.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Tag className="h-3 w-3" />Partenaire</Label>
                        <Select value={selectedPartnerId || "none"} onValueChange={v => setSelectedPartnerId(v === "none" ? "" : v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Client standard" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun partenaire</SelectItem>
                            {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (−{p.discountPercent}%)</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {loyaltyCards.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><CreditCard className="h-3 w-3" />Carte de fidélité</Label>
                        <Select value={selectedLoyaltyId || "none"} onValueChange={v => setSelectedLoyaltyId(v === "none" ? "" : v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Aucune carte" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune carte</SelectItem>
                            {loyaltyCards.map(c => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName} (−{c.discountPercent}%)</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {discountPercent > 0 && (
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-500">
                        <p className="font-semibold">Remise appliquée : −{discountPercent}%</p>
                        <div className="flex justify-between mt-1"><span>Réduction</span><span>−{fmt(discountAmount)}</span></div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Ajustement personnalisé</Label>
                      <div className="flex gap-1.5">
                        <div className="flex rounded-md border border-border overflow-hidden">
                          <button onClick={() => setAdjSign("minus")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjSign === "minus" ? "bg-destructive text-destructive-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>−</button>
                          <button onClick={() => setAdjSign("plus")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjSign === "plus" ? "bg-emerald-500 text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>+</button>
                        </div>
                        <Input type="number" min="0" step="0.01" placeholder="0" value={adjValue} onChange={e => setAdjValue(e.target.value)} className="h-8 text-xs flex-1" />
                        <div className="flex rounded-md border border-border overflow-hidden">
                          <button onClick={() => setAdjType("PERCENT")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjType === "PERCENT" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>%</button>
                          <button onClick={() => setAdjType("FIXED")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjType === "FIXED" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>{currency}</button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-1.5">
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-xl font-bold">{fmt(total)}</span>
                      </div>
                    </div>

                    <Textarea placeholder="Note (optionnel)" rows={2} className="text-xs" value={note} onChange={e => setNote(e.target.value)} />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button className="w-full" onClick={createTicket} disabled={loading}>{loading ? "Envoi..." : `Envoyer la commande (${cartCount})`}</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
