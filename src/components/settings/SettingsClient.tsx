"use client"
import { useState } from "react"
import { Save, CheckCircle, ImageIcon, ShieldCheck, Plus, Trash2, Users, Webhook, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CONFIGURABLE_PAGES } from "@/lib/page-permissions"

interface Restaurant { id: string; name: string; currency: string; bonusRate?: number; dividendRate?: number; logo?: string | null; webhookUrl?: string | null }
interface RestaurantUser { id: string; name: string | null; email: string; role: string }
interface AccessRoleData {
  id: string; name: string
  permissions: { page: string }[]
  users: RestaurantUser[]
}

export default function SettingsClient({
  restaurant,
  accessRoles: initialRoles = [],
  restaurantUsers = [],
  webhookUrl: initialWebhookUrl = "",
}: {
  restaurant: Restaurant
  accessRoles?: AccessRoleData[]
  restaurantUsers?: RestaurantUser[]
  webhookUrl?: string
}) {
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
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl)
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  // Access roles state
  const [roles, setRoles] = useState<AccessRoleData[]>(initialRoles)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoles[0]?.id ?? "")
  const [rolePages, setRolePages] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(initialRoles.map(r => [r.id, new Set(r.permissions.map(p => p.page))]))
  )
  const [roleUsers, setRoleUsers] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(initialRoles.map(r => [r.id, r.users.map(u => u.id)]))
  )
  const [roleSaving, setRoleSaving] = useState<Record<string, boolean>>({})
  const [roleSaved, setRoleSaved] = useState<Record<string, boolean>>({})
  const [newRoleName, setNewRoleName] = useState("")
  const [creatingRole, setCreatingRole] = useState(false)

  function togglePage(roleId: string, pageKey: string) {
    setRolePages(prev => {
      const next = new Set(prev[roleId] ?? [])
      next.has(pageKey) ? next.delete(pageKey) : next.add(pageKey)
      return { ...prev, [roleId]: next }
    })
  }

  async function createRole() {
    if (!newRoleName.trim()) return
    setCreatingRole(true)
    const res = await fetch("/api/access-roles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName.trim() }),
    })
    if (res.ok) {
      const role: AccessRoleData = await res.json()
      setRoles(prev => [...prev, role])
      setRolePages(prev => ({ ...prev, [role.id]: new Set() }))
      setRoleUsers(prev => ({ ...prev, [role.id]: [] }))
      setSelectedRoleId(role.id)
      setNewRoleName("")
    }
    setCreatingRole(false)
  }

  async function saveRole(roleId: string) {
    setRoleSaving(p => ({ ...p, [roleId]: true }))
    const res = await fetch(`/api/access-roles/${roleId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pages: Array.from(rolePages[roleId] ?? []),
        userIds: roleUsers[roleId] ?? [],
      }),
    })
    if (res.ok) {
      const updated: AccessRoleData = await res.json()
      setRoles(prev => prev.map(r => r.id === roleId ? updated : r))
      router.refresh()
    }
    setRoleSaving(p => ({ ...p, [roleId]: false }))
    setRoleSaved(p => ({ ...p, [roleId]: true }))
    setTimeout(() => setRoleSaved(p => ({ ...p, [roleId]: false })), 3000)
  }

  async function deleteRole(roleId: string) {
    const res = await fetch(`/api/access-roles/${roleId}`, { method: "DELETE" })
    if (res.ok) {
      setRoles(prev => prev.filter(r => r.id !== roleId))
      if (selectedRoleId === roleId) setSelectedRoleId(roles.find(r => r.id !== roleId)?.id ?? "")
    }
  }

  function addUserToRole(roleId: string, userId: string) {
    if (!userId) return
    setRoleUsers(prev => {
      const current = prev[roleId] ?? []
      if (current.includes(userId)) return prev
      return { ...prev, [roleId]: [...current, userId] }
    })
  }

  function removeUserFromRole(roleId: string, userId: string) {
    setRoleUsers(prev => ({ ...prev, [roleId]: (prev[roleId] ?? []).filter(id => id !== userId) }))
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
        webhookUrl: webhookUrl.trim() || null,
      }),
    })
    setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000); router.refresh()
  }

  async function testWebhook() {
    setWebhookTesting(true)
    setWebhookTestResult(null)
    const res = await fetch("/api/restaurants/webhook", { method: "POST" })
    const data = await res.json()
    setWebhookTestResult(res.ok ? { ok: true, msg: "Webhook envoyé avec succès !" } : { ok: false, msg: data.error ?? "Erreur inconnue" })
    setWebhookTesting(false)
  }

  const systemRoles = [
    { name: "Patron (OWNER)", desc: "Accès complet — tous les modules + paramètres", variant: "default" as const },
    { name: "Manager (MANAGER)", desc: "Gestion employés, commandes, fournisseurs, factures — pas les paramètres", variant: "secondary" as const },
    { name: "Employé (EMPLOYEE)", desc: "Dashboard personnel, commandes uniquement", variant: "outline" as const },
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-primary" />Webhook hebdomadaire</CardTitle>
          <CardDescription>Chaque lundi à 1h du matin, un résumé de la semaine précédente est envoyé automatiquement à cette URL via une requête POST JSON.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>URL du webhook</Label>
            <Input
              placeholder="https://hooks.slack.com/..."
              value={webhookUrl}
              onChange={e => { setWebhookUrl(e.target.value); setWebhookTestResult(null) }}
            />
            <p className="text-xs text-muted-foreground">Laisse vide pour désactiver</p>
          </div>
          {webhookTestResult && (
            <div className={`rounded-md px-3 py-2 text-sm flex items-center gap-2 ${webhookTestResult.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
              {webhookTestResult.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : null}
              {webhookTestResult.msg}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={testWebhook} disabled={webhookTesting || !webhookUrl.trim()}>
            <Send className="h-3.5 w-3.5" />{webhookTesting ? "Envoi en cours..." : "Tester le webhook"}
          </Button>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={loading}>
        {saved ? <><CheckCircle className="h-4 w-4" /> Enregistré</> : <><Save className="h-4 w-4" />{loading ? "Enregistrement..." : "Enregistrer"}</>}
      </Button>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Rôles et permissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {systemRoles.map(r => (
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Rôles d'accès personnalisés</CardTitle>
          <CardDescription>Créez des rôles avec des pages spécifiques et assignez-les à vos employés et managers. Un utilisateur sans rôle d'accès hérite des droits par défaut de son rôle système.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Créer un nouveau rôle */}
          <div className="flex gap-2">
            <Input
              placeholder="Nom du rôle (ex : Caissier, Chef de salle…)"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createRole()}
              className="flex-1"
            />
            <Button onClick={createRole} disabled={creatingRole || !newRoleName.trim()}>
              <Plus className="h-4 w-4" />{creatingRole ? "Création..." : "Créer"}
            </Button>
          </div>

          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun rôle d'accès — créez-en un ci-dessus.</p>
          )}

          {/* Onglets des rôles */}
          {roles.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {roles.map(r => (
                <button key={r.id} onClick={() => setSelectedRoleId(r.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${selectedRoleId === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                  {r.name}
                  {(roleUsers[r.id]?.length ?? 0) > 0 && (
                    <span className="ml-1.5 text-[10px] opacity-75">{roleUsers[r.id].length} pers.</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Panneau du rôle sélectionné */}
          {selectedRoleId && roles.find(r => r.id === selectedRoleId) && (() => {
            const role = roles.find(r => r.id === selectedRoleId)!
            const assigned = roleUsers[role.id] ?? []
            const unassigned = restaurantUsers.filter(u => !assigned.includes(u.id))
            return (
              <div className="rounded-lg border p-4 space-y-4">
                {/* Pages */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pages accessibles</p>
                  <div className="grid grid-cols-2 gap-1">
                    {CONFIGURABLE_PAGES.map(page => (
                      <label key={page.key} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors">
                        <input type="checkbox" checked={rolePages[role.id]?.has(page.key) ?? false}
                          onChange={() => togglePage(role.id, page.key)}
                          className="h-4 w-4 rounded border-border accent-primary" />
                        <span className="text-sm">{page.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(rolePages[role.id]?.size ?? 0) === 0
                      ? "Aucune page cochée — droits par défaut du rôle système"
                      : `${rolePages[role.id]?.size} page(s) autorisée(s)`}
                  </p>
                </div>

                <Separator />

                {/* Membres assignés */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" />Membres assignés</p>
                  {assigned.length === 0 && <p className="text-xs text-muted-foreground">Aucun membre</p>}
                  <div className="space-y-1">
                    {assigned.map(uid => {
                      const u = restaurantUsers.find(x => x.id === uid)
                      if (!u) return null
                      return (
                        <div key={uid} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
                          <div>
                            <span className="text-sm font-medium">{u.name ?? u.email}</span>
                            <Badge variant="outline" className="ml-2 text-[10px] h-4">{u.role === "MANAGER" ? "Manager" : "Employé"}</Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeUserFromRole(role.id, uid)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                  {unassigned.length > 0 && (
                    <Select onValueChange={uid => addUserToRole(role.id, uid)} value="">
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Ajouter un membre…" /></SelectTrigger>
                      <SelectContent>
                        {unassigned.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name ?? u.email} — {u.role === "MANAGER" ? "Manager" : "Employé"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => { if (confirm(`Supprimer le rôle "${role.name}" ?`)) deleteRole(role.id) }}>
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer ce rôle
                  </Button>
                  <Button size="sm" onClick={() => saveRole(role.id)} disabled={roleSaving[role.id]}>
                    {roleSaved[role.id] ? <><CheckCircle className="h-3.5 w-3.5" /> Enregistré</> : roleSaving[role.id] ? "Enregistrement..." : <><Save className="h-3.5 w-3.5" /> Enregistrer</>}
                  </Button>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
