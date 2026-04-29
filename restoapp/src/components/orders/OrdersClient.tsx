"use client"

import { useState, useMemo } from "react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Plus, Minus, ShoppingCart, Trash2, CheckCircle, Clock, XCircle, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface OrderLine {
  quantity: number
  unitPrice: number
  menuItem: { name: string }
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
  employee: { firstName: string; lastName: string } | null
  lines: OrderLine[]
}

interface CartItem {
  item: MenuItem
  qty: number
}

interface Props {
  menuItems: MenuItem[]
  orders: Order[]
  role: string
  employeeId: string | null
  currency: string
}

export default function OrdersClient({ menuItems, orders, role, employeeId, currency }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")

  const fmt = (n: number) => formatCurrency(n, currency)

  const categories = useMemo(() => [...new Set(menuItems.map((m) => m.category))], [menuItems])

  const filtered = useMemo(() =>
    menuItems.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [menuItems, search]
  )

  const grouped = useMemo(() =>
    categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
      acc[cat] = filtered.filter((m) => m.category === cat)
      return acc
    }, {}),
    [filtered, categories]
  )

  const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0)

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => c.item.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    )
  }

  async function confirmOrder() {
    if (cart.length === 0 || !employeeId) return
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: cart.map((c) => ({ menuItemId: c.item.id, quantity: c.qty, unitPrice: c.item.price })),
          note,
        }),
      })
      if (!res.ok) throw new Error()
      setCart([])
      setNote("")
      router.refresh()
    } catch {
      alert("Erreur lors de la création de la commande")
    } finally {
      setLoading(false)
    }
  }

  const statusLabel = (s: string) => s === "CONFIRMED" ? "Confirmée" : s === "CANCELLED" ? "Annulée" : "En attente"
  const StatusIcon = ({ s }: { s: string }) =>
    s === "CONFIRMED" ? <CheckCircle className="w-4 h-4 text-green-500" /> :
    s === "CANCELLED" ? <XCircle className="w-4 h-4 text-red-500" /> :
    <Clock className="w-4 h-4 text-amber-500" />

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="page-title">Commandes</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Prenez une commande et consultez l'historique</p>
      </div>

      {employeeId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
              <input
                className="input pl-9"
                placeholder="Rechercher un article..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {Object.entries(grouped).map(([cat, items]) =>
              items.length === 0 ? null : (
                <div key={cat} className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{cat}</p>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {items.map((item) => {
                      const inCart = cart.find((c) => c.item.id === item.id)
                      return (
                        <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--text)]">{item.name}</p>
                            <p className="text-sm text-brand-500 font-semibold">{fmt(item.price)}</p>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold text-[var(--text)] w-5 text-center">{inCart.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600 transition-colors">
                                <Plus className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600 transition-colors">
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="card p-4 h-fit sticky top-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--text-muted)]" />
              <h2 className="section-title">Panier</h2>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">Panier vide</p>
            ) : (
              <>
                <div className="space-y-2">
                  {cart.map((c) => (
                    <div key={c.item.id} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center">{c.qty}</span>
                      <span className="text-sm text-[var(--text)] flex-1 truncate">{c.item.name}</span>
                      <span className="text-sm font-medium text-[var(--text)]">{fmt(c.item.price * c.qty)}</span>
                      <button onClick={() => setCart((p) => p.filter((x) => x.item.id !== c.item.id))} className="text-[var(--text-subtle)] hover:text-[var(--danger)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total</span>
                    <span className="text-lg font-bold text-[var(--text)]">{fmt(total)}</span>
                  </div>
                </div>

                <textarea
                  className="input text-xs resize-none"
                  rows={2}
                  placeholder="Note (optionnel)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <button
                  onClick={confirmOrder}
                  disabled={loading}
                  className="btn-primary w-full py-2.5"
                >
                  {loading ? "Envoi..." : "Confirmer la commande"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="section-title">{role === "EMPLOYEE" ? "Mes commandes" : "Toutes les commandes"}</h2>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
                {(role === "OWNER" || role === "MANAGER") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[var(--text-muted)] py-8">Aucune commande</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">
                      {order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}
                    </td>
                    <td className="text-[var(--text-muted)] max-w-xs truncate">
                      {order.lines.map((l) => `${l.quantity}× ${l.menuItem.name}`).join(", ")}
                    </td>
                    <td className="font-semibold">{fmt(order.total)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon s={order.status} />
                        <span className={`text-xs font-medium ${
                          order.status === "CONFIRMED" ? "text-green-600 dark:text-green-400" :
                          order.status === "CANCELLED" ? "text-red-500" : "text-amber-500"
                        }`}>{statusLabel(order.status)}</span>
                      </div>
                    </td>
                    <td className="text-[var(--text-muted)] text-xs">{formatDateTime(order.createdAt)}</td>
                    {(role === "OWNER" || role === "MANAGER") && (
                      <td>
                        {order.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CONFIRMED" }) })
                                router.refresh()
                              }}
                              className="text-xs text-green-600 hover:underline"
                            >Confirmer</button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) })
                                router.refresh()
                              }}
                              className="text-xs text-red-500 hover:underline"
                            >Annuler</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
