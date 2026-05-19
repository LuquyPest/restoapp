"use client"
import { useState, useMemo } from "react"
import { Plus, Minus, ShoppingCart, Trash2, CheckCircle, Clock, XCircle, Search, ImageIcon, Tag, Filter, CreditCard } from "lucide-react"
import { formatCurrency, formatDateTime, getISOWeek } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MenuItem { id: string; name: string; price: number; costPrice: number; category: string; imageUrl: string | null }
interface Partner { id: string; name: string; discountPercent: number }
interface LoyaltyCard { id: string; firstName: string; lastName: string; discountPercent: number; expiresAt: Date }
interface OrderLine { quantity: number; unitPrice: number; menuItem: { name: string } }
interface Order {
  id: string; total: number; discountAmount: number; status: string; createdAt: Date; note: string | null
  customAdjustmentType: string | null; customAdjustmentValue: number | null
  employee: { id: string; firstName: string; lastName: string } | null
  partner: Partner | null
  loyaltyCard: LoyaltyCard | null
  lines: OrderLine[]
}
interface CartItem { item: MenuItem; qty: number }
interface Props {
  menuItems: MenuItem[]; orders: Order[]; partners: Partner[]
  loyaltyCards: LoyaltyCard[]; role: string; currency: string
  employees?: { id: string; firstName: string; lastName: string }[]
}

export default function OrdersClient({ menuItems, orders, partners, loyaltyCards, role, currency, employees = [] }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")
  const [view, setView] = useState<"order" | "history">("order")
  const [selectedPartnerId, setSelectedPartnerId] = useState("")
  const [selectedLoyaltyId, setSelectedLoyaltyId] = useState("")
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [adjSign, setAdjSign] = useState<"plus" | "minus">("minus")
  const [adjType, setAdjType] = useState<"PERCENT" | "FIXED">("PERCENT")
  const [adjValue, setAdjValue] = useState("")

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
  const appliedDiscount = discountPercent > 0 ? (partnerDiscount >= loyaltyDiscount ? selectedPartner?.name : `${selectedLoyalty?.firstName} ${selectedLoyalty?.lastName}`) : null

  const filteredOrders = useMemo(() => orders.filter(o => {
    if (filterEmployee && o.employee?.id !== filterEmployee) return false
    if (filterStatus && o.status !== filterStatus) return false
    if (filterDateFrom && new Date(o.createdAt) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(o.createdAt) > new Date(filterDateTo + "T23:59:59")) return false
    return true
  }), [orders, filterEmployee, filterStatus, filterDateFrom, filterDateTo])

  const totalFiltered = filteredOrders.filter(o => o.status === "CONFIRMED").reduce((s, o) => s + o.total, 0)

  function addToCart(item: MenuItem) {
    setCart(prev => { const ex = prev.find(c => c.item.id === item.id); if (ex) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c); return [...prev, { item, qty: 1 }] })
  }
  function updateQty(id: string, delta: number) { setCart(prev => prev.map(c => c.item.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0)) }
  function setQty(id: string, val: string) {
    const n = parseInt(val, 10)
    if (isNaN(n) || n < 1) setCart(prev => prev.filter(c => c.item.id !== id))
    else setCart(prev => prev.map(c => c.item.id === id ? { ...c, qty: n } : c))
  }

  async function confirmOrder() {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const clientNow = new Date()
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: cart.map(c => ({ menuItemId: c.item.id, quantity: c.qty })),
          note: note || undefined,
          partnerId: selectedPartnerId || null,
          loyaltyCardId: selectedLoyaltyId || null,
          customAdjustmentType: adjRawValue > 0 ? adjType : null,
          customAdjustmentValue: adjRawValue > 0 ? adjSignedValue : null,
          weekNumber: getISOWeek(clientNow),
          year: clientNow.getFullYear(),
        }),
      })
      if (!res.ok) throw new Error()
      setCart([]); setNote(""); setSelectedPartnerId(""); setSelectedLoyaltyId(""); setAdjValue(""); router.refresh()
    } catch { alert("Erreur") } finally { setLoading(false) }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    router.refresh()
  }

  const StatusBadge = ({ s }: { s: string }) => {
    if (s === "CONFIRMED") return <Badge variant="success"><CheckCircle className="h-3 w-3" /> Confirmée</Badge>
    if (s === "CANCELLED") return <Badge variant="destructive"><XCircle className="h-3 w-3" /> Annulée</Badge>
    return <Badge variant="warning"><Clock className="h-3 w-3" /> En attente</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
          <p className="text-sm text-muted-foreground mt-1">Nouvelle commande ou historique</p>
        </div>
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {(["order", "history"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {v === "order" ? `Commande${cartCount > 0 ? ` (${cartCount})` : ""}` : "Historique"}
            </button>
          ))}
        </div>
      </div>

      {view === "order" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map(item => {
                const inCart = cart.find(c => c.item.id === item.id)
                return (
                  <Card key={item.id} className="overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:-translate-y-0.5" onClick={() => addToCart(item)}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-24 w-full object-contain bg-muted p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    ) : (
                      <div className="h-20 bg-muted flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                    )}
                    <CardContent className="p-3">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-primary">{fmt(item.price)}</span>
                        {inCart && <Badge variant="default" className="text-[10px] px-1.5">×{inCart.qty}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {filtered.length === 0 && <div className="col-span-full py-10 text-center text-sm text-muted-foreground">Aucun article</div>}
            </div>
          </div>

          {/* Cart */}
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><ShoppingCart className="h-4 w-4 text-primary" />Panier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">Cliquez sur un article</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {cart.map(c => (
                      <div key={c.item.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(c.item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <input
                            type="number" min="1"
                            value={c.qty}
                            onChange={e => setQty(c.item.id, e.target.value)}
                            onFocus={e => e.target.select()}
                            className="h-6 w-10 text-center text-sm font-semibold bg-transparent border border-border rounded focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <Button size="icon" className="h-6 w-6" onClick={() => updateQty(c.item.id, 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <span className="flex-1 text-xs truncate">{c.item.name}</span>
                        <span className="text-sm font-semibold">{fmt(c.item.price * c.qty)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => setCart(p => p.filter(x => x.item.id !== c.item.id))}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>

                  {/* Partner selector */}
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

                  {/* Loyalty card selector */}
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

                  {/* Applied discount info */}
                  {discountPercent > 0 && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-500">
                      <p className="font-semibold">Remise appliquée : −{discountPercent}%</p>
                      {partnerDiscount > 0 && loyaltyDiscount > 0 && partnerDiscount !== loyaltyDiscount && (
                        <p className="opacity-80 mt-0.5">La meilleure remise est appliquée (non cumulable)</p>
                      )}
                      <div className="flex justify-between mt-1">
                        <span>Réduction</span><span>−{fmt(discountAmount)}</span>
                      </div>
                    </div>
                  )}

                  {/* Custom adjustment */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ajustement personnalisé</Label>
                    <div className="flex gap-1.5">
                      <div className="flex rounded-md border border-border overflow-hidden">
                        <button onClick={() => setAdjSign("minus")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjSign === "minus" ? "bg-destructive text-destructive-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>−</button>
                        <button onClick={() => setAdjSign("plus")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjSign === "plus" ? "bg-emerald-500 text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>+</button>
                      </div>
                      <Input
                        type="number" min="0" step="0.01"
                        placeholder="0"
                        value={adjValue}
                        onChange={e => setAdjValue(e.target.value)}
                        className="h-8 text-xs flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <div className="flex rounded-md border border-border overflow-hidden">
                        <button onClick={() => setAdjType("PERCENT")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjType === "PERCENT" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>%</button>
                        <button onClick={() => setAdjType("FIXED")} className={`px-2.5 py-1 text-xs font-semibold transition-colors ${adjType === "FIXED" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>{currency}</button>
                      </div>
                    </div>
                    {adjRawValue > 0 && (
                      <p className={`text-xs font-medium ${adjSign === "minus" ? "text-destructive" : "text-emerald-500"}`}>
                        {adjSign === "minus" ? "−" : "+"}{fmt(Math.abs(customAdjustmentAmount))}
                        {adjType === "PERCENT" && ` (${adjRawValue}%)`}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3 space-y-1.5">
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sous-total</span><span>{fmt(subtotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-xl font-bold">{fmt(total)}</span>
                    </div>
                  </div>

                  <Textarea placeholder="Note (optionnel)" rows={2} className="text-xs" value={note} onChange={e => setNote(e.target.value)} />
                  <Button className="w-full" onClick={confirmOrder} disabled={loading}>{loading ? "Envoi..." : "Confirmer la commande"}</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {view === "history" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2"><Filter className="h-4 w-4" /> Filtres</div>
                {(role === "OWNER" || role === "MANAGER") && employees.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs">Employé</Label>
                    <Select value={filterEmployee || "all"} onValueChange={v => setFilterEmployee(v === "all" ? "" : v)}>
                      <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Statut</Label>
                  <Select value={filterStatus || "all"} onValueChange={v => setFilterStatus(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="CANCELLED">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Du</Label><Input type="date" className="h-8 w-36 text-xs" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Au</Label><Input type="date" className="h-8 w-36 text-xs" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} /></div>
                {(filterEmployee || filterStatus || filterDateFrom || filterDateTo) && (
                  <Button variant="ghost" size="sm" onClick={() => { setFilterEmployee(""); setFilterStatus(""); setFilterDateFrom(""); setFilterDateTo("") }}>Réinitialiser</Button>
                )}
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t text-sm">
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">{filteredOrders.length}</span> commande{filteredOrders.length > 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">CA confirmé : <span className="font-bold text-primary">{fmt(totalFiltered)}</span></span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Remise</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  {(role === "OWNER" || role === "MANAGER") && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune commande</TableCell></TableRow>
                ) : filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[180px]">
                      <span className="truncate block">{order.lines.map(l => `${l.quantity}× ${l.menuItem.name}`).join(", ")}</span>
                      <div className="flex gap-1 mt-1">
                        {order.partner && <Badge variant="default" className="text-[10px]">{order.partner.name}</Badge>}
                        {order.loyaltyCard && <Badge variant="secondary" className="text-[10px] gap-1"><CreditCard className="h-2.5 w-2.5" />{order.loyaltyCard.firstName} {order.loyaltyCard.lastName}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.discountAmount > 0 && <div className="text-emerald-500">−{fmt(order.discountAmount)}</div>}
                      {(() => {
                        if (order.customAdjustmentValue == null || order.customAdjustmentValue === 0) return null
                        const lineSubtotal = order.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
                        const afterDiscount = lineSubtotal - order.discountAmount
                        const adjAmt = order.customAdjustmentType === "PERCENT"
                          ? afterDiscount * (order.customAdjustmentValue / 100)
                          : order.customAdjustmentValue
                        return (
                          <div className={adjAmt < 0 ? "text-destructive" : "text-emerald-500"}>
                            {adjAmt < 0 ? "−" : "+"}{fmt(Math.abs(adjAmt))}
                            {order.customAdjustmentType === "PERCENT" && ` (${Math.abs(order.customAdjustmentValue)}%)`}
                          </div>
                        )
                      })()}
                      {order.discountAmount === 0 && (order.customAdjustmentValue == null || order.customAdjustmentValue === 0) && "—"}
                    </TableCell>
                    <TableCell className="font-semibold">{fmt(order.total)}</TableCell>
                    <TableCell><StatusBadge s={order.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</TableCell>
                    {(role === "OWNER" || role === "MANAGER") && (
                      <TableCell>
                        {order.status === "PENDING" && (
                          <div className="flex gap-1.5">
                            <Button variant="success" size="sm" className="h-7 text-xs" onClick={() => updateStatus(order.id, "CONFIRMED")}>Confirmer</Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs hover:bg-destructive/10 hover:text-destructive" onClick={() => updateStatus(order.id, "CANCELLED")}>Annuler</Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  )
}
