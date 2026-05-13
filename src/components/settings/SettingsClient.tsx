"use client"
import { useState } from "react"
import { Save, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Restaurant { id: string; name: string; currency: string; bonusRate?: number; dividendRate?: number }

export default function SettingsClient({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: restaurant.name,
    currency: restaurant.currency,
    bonusRate: String(restaurant.bonusRate ?? 30),
    dividendRate: String(restaurant.dividendRate ?? 45),
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setLoading(true)
    await fetch("/api/restaurants", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, currency: form.currency,
        bonusRate: parseFloat(form.bonusRate),
        dividendRate: parseFloat(form.dividendRate),
      }),
    })
    setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000); router.refresh()
  }

  const roles = [
    { name: "Patron (OWNER)", desc: "Accès complet — tous les modules + paramètres", variant: "default" as const },
    { name: "Manager (MANAGER)", desc: "Gestion employés, commandes, fournisseurs, factures — pas les paramètres", variant: "secondary" as const },
    { name: "Employé (EMPLOYEE)", desc: "Dashboard personnel, commandes, carte, ses payes", variant: "outline" as const },
  ]

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuration de votre établissement</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Établissement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom de l'établissement</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Symbole monétaire</Label>
            <Input className="w-24" maxLength={5} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
            <p className="text-xs text-muted-foreground">Affiché partout dans l'application</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taux du bilan</CardTitle>
          <CardDescription>Appliqués sur le bénéfice net</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Taux prime (%)</Label>
              <div className="relative">
                <Input type="number" min="0" max="100" step="0.01" className="pr-7" value={form.bonusRate} onChange={e => setForm({ ...form, bonusRate: e.target.value })} />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">% du bénéfice net</p>
            </div>
            <div className="space-y-1.5">
              <Label>Taux dividende (%)</Label>
              <div className="relative">
                <Input type="number" min="0" max="100" step="0.01" className="pr-7" value={form.dividendRate} onChange={e => setForm({ ...form, dividendRate: e.target.value })} />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">% du bénéfice net</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">Barème d'imposition (Catégorie 3) — automatique</p>
            <div className="grid grid-cols-2 gap-1">
              <span>$0 → $50 000</span><span className="font-medium">Non imposable</span>
              <span>$50 001 → $100 000</span><span className="font-medium">20% sur la tranche</span>
              <span>$100 001 → $500 000</span><span className="font-medium">30% sur la tranche</span>
              <span>Au-delà de $500 001</span><span className="font-medium">40% sur la tranche</span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p><strong>Bénéfice brut</strong> = CA − salaires − charges déductibles</p>
            <p><strong>Impôts</strong> = barème progressif sur le bénéfice brut</p>
            <p><strong>Bénéfice net</strong> = Bénéfice brut − impôts</p>
            <p><strong>Prime</strong> = Bénéfice net × {form.bonusRate || "?"}%</p>
            <p><strong>Dividendes</strong> = Bénéfice net × {form.dividendRate || "?"}%</p>
            <p><strong>Trésorerie</strong> = Bénéfice net − prime − dividendes − charges non déductibles</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={loading}>
        {saved ? <><CheckCircle className="h-4 w-4" /> Enregistré</> : <><Save className="h-4 w-4" />{loading ? "Enregistrement..." : "Enregistrer"}</>}
      </Button>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Rôles et permissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {roles.map(r => (
            <div key={r.name} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge variant={r.variant} className="mt-0.5 shrink-0">{r.name.split(" ")[0]}</Badge>
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
