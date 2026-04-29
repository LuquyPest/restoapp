"use client"

import { useState, useMemo } from "react"
import { Plus, Minus, ShoppingCart, Trash2, CheckCircle, Clock, XCircle, Search, Image as ImageIcon, Tag, Filter } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface MenuItem { id: string; name: string; price: number; costPrice: number; category: string; imageUrl: string | null }
interface Partner { id: string; name: string; discountPercent: number }
interface OrderLine { quantity: number; unitPrice: number; menuItem: { name: string } }
interface Order {
  id: string; total: number; discountAmount: number; status: string; createdAt: Date; note: string | null
  employee: { id: string; firstName: string; lastName: string } | null
  partner: Partner | null
  lines: OrderLine[]
}
interface CartItem { item: MenuItem; qty: number }
interface Props { menuItems: MenuItem[]; orders: Order[]; partners: Partner[]; role: string; currency: string; employees?: { id: string; firstName: string; lastName: string }[] }

export default function OrdersClient({ menuItems, orders, partners, role, currency, employees = [] }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")
  const [view, setView] = useState<"order" | "history">("order")
  const [selectedPartnerId, setSelectedPartnerId] = useState("")

  // Filters for history
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const fmt = (n: number) => formatCurrency(n, currency)
  const categories = useMemo(() => ["Tous", ...new Set(menuItems.map(m => m.category))], [menuItems])
  const filtered = useMemo(() => menuItems.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeCategory === "Tous" || m.category === activeCategory)
  ), [menuItems, search, activeCategory])

  const selectedPartner = partners.find(p => p.id === selectedPartnerId) ?? null
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0)
  const discount = selectedPartner ? subtotal * (selectedPartner.discountPercent / 100) : 0
  const total = Math.max(0, subtotal - discount)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const filteredOrders = useMemo(() => orders.filter(o => {
    if (filterEmployee && o.employee?.id !== filterEmployee) return false
    if (filterStatus && o.status !== filterStatus) return false
    if (filterDateFrom && new Date(o.createdAt) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(o.createdAt) > new Date(filterDateTo + "T23:59:59")) return false
    return true
  }), [orders, filterEmployee, filterStatus, filterDateFrom, filterDateTo])

  const totalFiltered = filteredOrders.filter(o => o.status === "CONFIRMED").reduce((s, o) => s + o.total, 0)

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const ex = prev.find(c => c.item.id === item.id)
      if (ex) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.item.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0))
  }

  async function confirmOrder() {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: cart.map(c => ({ menuItemId: c.item.id, quantity: c.qty, unitPrice: c.item.price, costPrice: c.item.costPrice })),
          note: note || undefined,
          partnerId: selectedPartnerId || null,
        }),
      })
      if (!res.ok) throw new Error()
      setCart([]); setNote(""); setSelectedPartnerId(""); router.refresh()
    } catch { alert("Erreur lors de la commande") }
    finally { setLoading(false) }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    router.refresh()
  }

  const StatusBadge = ({ s }: { s: string }) => {
    if (s === "CONFIRMED") return <span className="badge badge-green"><CheckCircle size={10} /> Confirmée</span>
    if (s === "CANCELLED") return <span className="badge badge-red"><XCircle size={10} /> Annulée</span>
    return <span className="badge badge-amber"><Clock size={10} /> En attente</span>
  }

  const hasFilters = filterEmployee || filterDateFrom || filterDateTo || filterStatus

  return (
    <div className="animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Commandes</h1>
          <p className="page-sub">Nouvelle commande ou historique</p>
        </div>
        <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
          {(["order", "history"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.15s",
              background: view === v ? "var(--accent)" : "transparent",
              color: view === v ? "#fff" : "var(--text-muted)",
            }}>
              {v === "order" ? `Commande${cartCount > 0 ? ` (${cartCount})` : ""}` : "Historique"}
            </button>
          ))}
        </div>
      </div>

      {view === "order" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
                <input className="input" placeholder="Rechercher..." style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: "4px 12px", borderRadius: 20, border: "1px solid",
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    background: activeCategory === cat ? "var(--accent)" : "var(--bg-elevated)",
                    borderColor: activeCategory === cat ? "var(--accent)" : "var(--border)",
                    color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                  }}>{cat}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {filtered.map(item => {
                const inCart = cart.find(c => c.item.id === item.id)
                return (
                  <div key={item.id} className="card" style={{ overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s, transform 0.15s" }}
                    onClick={() => addToCart(item)}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--accent)"; el.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.transform = "translateY(0)"; }}
                  >
                    {item.imageUrl ? (
                      <div style={{ height: 100, overflow: "hidden", background: "var(--bg)" }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                      </div>
                    ) : (
                      <div style={{ height: 70, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImageIcon size={18} style={{ color: "var(--text-subtle)" }} />
                      </div>
                    )}
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.name}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{fmt(item.price)}</span>
                        {inCart && <span style={{ fontSize: 11, fontWeight: 700, background: "var(--accent)", color: "#fff", borderRadius: 10, padding: "1px 7px" }}>×{inCart.qty}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && <div style={{ gridColumn: "1/-1", padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Aucun article</div>}
            </div>
          </div>

          {/* Cart */}
          <div className="card" style={{ padding: 18, position: "sticky", top: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <ShoppingCart size={15} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Panier</span>
            </div>
            {cart.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>Cliquez sur un article</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {cart.map(c => (
                    <div key={c.item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <button onClick={() => updateQty(c.item.id, -1)} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={9} /></button>
                        <span style={{ fontSize: 13, fontWeight: 600, width: 18, textAlign: "center" }}>{c.qty}</span>
                        <button onClick={() => updateQty(c.item.id, 1)} style={{ width: 22, height: 22, borderRadius: 5, border: "none", background: "var(--accent)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={9} /></button>
                      </div>
                      <span style={{ flex: 1, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.item.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{fmt(c.item.price * c.qty)}</span>
                      <button onClick={() => setCart(p => p.filter(x => x.item.id !== c.item.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 2 }}><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
                {partners.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <label className="label" style={{ display: "flex", alignItems: "center", gap: 5 }}><Tag size={11} /> Partenaire</label>
                    <select className="input" value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)} style={{ fontSize: 13 }}>
                      <option value="">Aucun (client standard)</option>
                      {partners.map(p => <option key={p.id} value={p.id}>{p.name} (−{p.discountPercent}%)</option>)}
                    </select>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--green)", marginBottom: 6 }}>
                    <span>Remise {selectedPartner?.discountPercent}%</span><span>−{fmt(discount)}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{fmt(total)}</span>
                  </div>
                </div>
                <textarea className="input" rows={2} placeholder="Note (optionnel)" style={{ marginBottom: 10, fontSize: 12 }} value={note} onChange={e => setNote(e.target.value)} />
                <button onClick={confirmOrder} disabled={loading} className="btn-primary" style={{ width: "100%", height: 38 }}>
                  {loading ? "Envoi..." : "Confirmer"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {view === "history" && (
        <div>
          {/* Filters bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
              <Filter size={13} /> Filtres
            </div>
            {(role === "OWNER" || role === "MANAGER") && employees.length > 0 && (
              <div>
                <label className="label" style={{ marginBottom: 4 }}>Employé</label>
                <select className="input" style={{ width: 180 }} value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                  <option value="">Tous</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label" style={{ marginBottom: 4 }}>Statut</label>
              <select className="input" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tous</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
            <div>
              <label className="label" style={{ marginBottom: 4 }}>Du</label>
              <input type="date" className="input" style={{ width: 150 }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 4 }}>Au</label>
              <input type="date" className="input" style={{ width: 150 }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
            </div>
            {hasFilters && (
              <button onClick={() => { setFilterEmployee(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterStatus("") }} className="btn-ghost" style={{ height: 36, alignSelf: "flex-end" }}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Summary */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{filteredOrders.length}</span> commande{filteredOrders.length > 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              CA confirmé : <span style={{ fontWeight: 700, color: "var(--accent)" }}>{fmt(totalFiltered)}</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Articles</th>
                  <th>Partenaire</th>
                  <th>Remise</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                  {(role === "OWNER" || role === "MANAGER") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune commande</td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}</td>
                    <td style={{ color: "var(--text-muted)", maxWidth: 180 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {order.lines.map(l => `${l.quantity}× ${l.menuItem.name}`).join(", ")}
                      </span>
                    </td>
                    <td>{order.partner ? <span className="badge badge-accent">{order.partner.name}</span> : <span style={{ color: "var(--text-subtle)" }}>—</span>}</td>
                    <td style={{ color: "var(--green)" }}>{order.discountAmount > 0 ? `−${fmt(order.discountAmount)}` : "—"}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(order.total)}</td>
                    <td><StatusBadge s={order.status} /></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{formatDateTime(order.createdAt)}</td>
                    {(role === "OWNER" || role === "MANAGER") && (
                      <td>
                        {order.status === "PENDING" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => updateStatus(order.id, "CONFIRMED")} className="btn-success" style={{ height: 26, padding: "0 10px", fontSize: 11 }}>Confirmer</button>
                            <button onClick={() => updateStatus(order.id, "CANCELLED")} className="btn-danger" style={{ height: 26, padding: "0 10px", fontSize: 11 }}>Annuler</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
