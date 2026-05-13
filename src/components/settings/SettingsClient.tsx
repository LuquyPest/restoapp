"use client"
import { useState } from "react"
import { Save, CheckCircle, ImageIcon, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CONFIGURABLE_PAGES } from "@/lib/page-permissions"

interface Restaurant { id: string; name: string; currency: string; bonusRate?: number; dividendRate?: number; logo?: string | null }
interface GradeWithPerms { id: string; name: string; permissions: { page: string }[] }

export default function SettingsClient({ restaurant, grades = [] }: { restaurant: Restaurant; grades?: GradeWithPerms[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: restaurant.name,
    currency: restaurant.currency,
    bonusRate: String(restaurant.bonusRate ?? 30),
    dividendRate: String(restaurant.dividendRate ?? 45),
    logo: restaurant.logo ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Grade permissions state: gradeId → Set of allowed page keys
  const [permsState, setPermsState] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(grades.map(g => [g.id, new Set(g.permissions.map(p => p.page))]))
  )
  const [permsLoading, setPermsLoading] = useState<Record<string, boolean>>({})
  const [permsSaved, setPermsSaved] = useState<Record<string, boolean>>({})
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id ?? "")

  function togglePage(gradeId: string, pageKey: string) {
    setPermsState(prev => {
      const next = new Set(prev[gradeId])
      next.has(pageKey) ? next.delete(pageKey) : next.add(pageKey)
      return { ...prev, [gradeId]: next }
    })
  }

  async function savePerms(gradeId: string) {
    setPermsLoading(p => ({ ...p, [gradeId]: true }))
    await fetch(`/api/employees/grades/${gradeId}/permissions`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: Array.from(permsState[gradeId] ?? []) }),
    })
    setPermsLoading(p => ({ ...p, [gradeId]: false }))
    setPermsSaved(p => ({ ...p, [gradeId]: true }))
    setTimeout(() => setPermsSaved(p => ({ ...p, [gradeId]: false })), 3000)
  }

  async function save() {
    setLoading(true)
    await fetch("/api/restaurants", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, currency: form.currency,
        bonusRate: parseFloat(form.bonusRate),
        dividendRate: parseFloat(form.dividendRate),
        logo: form.logo || null,
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
        <CardHeader><CardTitle>Logo de l'établissement</CardTitle><CardDescription>Affiché dans la barre latérale de l'application</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl border bg-muted/40 flex items-center justify-center shrink-0 overflow-hidden">
              {form.logo
                ? <img src={form.logo} alt="Logo" className="h-full w-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                : <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
              }
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>Lien du logo (URL)</Label>
              <Input
                placeholder="https://exemple.com/logo.png"
                value={form.logo}
                onChange={e => setForm({ ...form, logo: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Colle l'URL directe de ton image (PNG, JPG, WebP…)</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {grades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Droits d'accès par grade</CardTitle>
            <CardDescription>Définissez les pages accessibles pour chaque grade. Si aucune page n'est cochée, le grade hérite des droits par défaut de son rôle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grade tabs */}
            <div className="flex gap-2 flex-wrap">
              {grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGradeId(g.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${selectedGradeId === g.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {g.name}
                  {permsState[g.id]?.size > 0 && (
                    <span className="ml-1.5 text-[10px] opacity-70">({permsState[g.id].size})</span>
                  )}
                </button>
              ))}
            </div>

            {selectedGradeId && (
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Pages accessibles — {grades.find(g => g.id === selectedGradeId)?.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CONFIGURABLE_PAGES.map(page => {
                    const checked = permsState[selectedGradeId]?.has(page.key) ?? false
                    return (
                      <label key={page.key} className="flex items-center gap-2.5 rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePage(selectedGradeId, page.key)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm">{page.label}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {permsState[selectedGradeId]?.size === 0
                      ? "Aucune restriction — droits par défaut du rôle"
                      : `${permsState[selectedGradeId]?.size} page(s) autorisée(s)`}
                  </p>
                  <Button size="sm" onClick={() => savePerms(selectedGradeId)} disabled={permsLoading[selectedGradeId]}>
                    {permsSaved[selectedGradeId]
                      ? <><CheckCircle className="h-3.5 w-3.5" /> Enregistré</>
                      : permsLoading[selectedGradeId] ? "Enregistrement..." : <><Save className="h-3.5 w-3.5" /> Enregistrer</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
