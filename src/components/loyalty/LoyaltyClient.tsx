"use client"
import { useState } from "react"
import { Plus, Minus, Trash2, CreditCard, Clock, AlertCircle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface LoyaltyCard {
  id: string; firstName: string; lastName: string
  discountPercent: number; expiresAt: Date; isActive: boolean; createdAt: Date
}

const EMPTY = { firstName: "", lastName: "", discountPercent: "" }

function getDaysLeft(expiresAt: Date) {
  const now = new Date()
  const diff = new Date(expiresAt).getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function LoyaltyClient({ cards }: { cards: LoyaltyCard[] }) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<LoyaltyCard | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    await fetch("/api/loyalty", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, discountPercent: parseFloat(form.discountPercent) }),
    })
    setLoading(false); setModal(null); setForm(EMPTY); router.refresh()
  }

  async function update() {
    if (!selected) return
    setLoading(true)
    await fetch(`/api/loyalty/${selected.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, discountPercent: parseFloat(form.discountPercent) }),
    })
    setLoading(false); setModal(null); router.refresh()
  }

  async function addWeek(id: string, weeks: number) {
    await fetch(`/api/loyalty/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addWeeks: weeks }),
    })
    router.refresh()
  }

  async function toggleActive(card: LoyaltyCard) {
    await fetch(`/api/loyalty/${card.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !card.isActive }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette carte ?")) return
    await fetch(`/api/loyalty/${id}`, { method: "DELETE" })
    router.refresh()
  }

  function openEdit(card: LoyaltyCard) {
    setSelected(card)
    setForm({ firstName: card.firstName, lastName: card.lastName, discountPercent: String(card.discountPercent) })
    setModal("edit")
  }

  const active = cards.filter(c => c.isActive && getDaysLeft(c.expiresAt) > 0)
  const expired = cards.filter(c => !c.isActive || getDaysLeft(c.expiresAt) <= 0)

  const CardItem = ({ card }: { card: LoyaltyCard }) => {
    const daysLeft = getDaysLeft(card.expiresAt)
    const isExpired = daysLeft <= 0
    const isUrgent = daysLeft > 0 && daysLeft <= 3

    return (
      <Card className={`transition-all ${isExpired || !card.isActive ? "opacity-60" : "hover:border-border/80"}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{card.firstName[0]}{card.lastName[0]}</span>
              </div>
              <div>
                <p className="font-semibold">{card.firstName} {card.lastName}</p>
                <p className="text-xs text-muted-foreground">−{card.discountPercent}% de remise</p>
              </div>
            </div>
            <div className="flex gap-1">
              {isExpired && <Badge variant="destructive" className="text-[10px]">EXPIRÉE</Badge>}
              {!isExpired && isUrgent && <Badge variant="warning" className="text-[10px]">URGENT</Badge>}
              {!isExpired && !isUrgent && card.isActive && <Badge variant="success" className="text-[10px]">Active</Badge>}
              {!card.isActive && !isExpired && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
            </div>
          </div>

          {/* Countdown */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            isExpired ? "bg-destructive/10 text-destructive" :
            isUrgent ? "bg-amber-500/10 text-amber-500" :
            "bg-muted text-muted-foreground"
          }`}>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {isExpired
              ? `Expirée depuis ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? "s" : ""}`
              : `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
          </div>

          {/* Week controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 flex-1 text-xs gap-1"
              onClick={() => addWeek(card.id, -1)} disabled={isExpired && daysLeft < -30}>
              <Minus className="h-3 w-3" /> 1 semaine
            </Button>
            <Button variant="outline" size="sm" className="h-7 flex-1 text-xs gap-1"
              onClick={() => addWeek(card.id, 1)}>
              <Plus className="h-3 w-3" /> 1 semaine
            </Button>
          </div>

          <Separator />
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={() => toggleActive(card)}>
              {card.isActive ? "Désactiver" : "Activer"}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(card)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => remove(card.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cartes de fidélité</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active.length} active{active.length > 1 ? "s" : ""} · {expired.length} expirée{expired.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setModal("create") }}>
          <Plus className="h-4 w-4" /> Nouvelle carte
        </Button>
      </div>

      {cards.length === 0 && (
        <Card className="p-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Aucune carte de fidélité</p>
          <Button onClick={() => setModal("create")}>Créer la première carte</Button>
        </Card>
      )}

      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Actives</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(c => <CardItem key={c.id} card={c} />)}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Expirées / Inactives</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expired.map(c => <CardItem key={c.id} card={c} />)}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Dialog open={modal === "create"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nouvelle carte de fidélité</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Réduction (%)</Label><Input type="number" min="0" max="100" step="0.1" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} /></div>
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              La carte sera valable 7 jours à partir de la création
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button className="flex-1" onClick={create} disabled={loading || !form.firstName || !form.discountPercent}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={modal === "edit"} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier la carte</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Réduction (%)</Label><Input type="number" min="0" max="100" step="0.1" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button className="flex-1" onClick={update} disabled={loading}>{loading ? "..." : "Enregistrer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
