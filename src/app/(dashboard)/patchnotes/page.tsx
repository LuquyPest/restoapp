import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { NotebookPen, Plus, Wrench, Zap } from "lucide-react"

const NOTES = [
  {
    version: "1.5.0",
    date: "21 mai 2026",
    entries: [
      { type: "feat", text: "Dashboard : courbe du CA sur les 8 dernières semaines — tendance visible en un coup d'œil" },
      { type: "feat", text: "Dashboard : classement des 5 articles les plus vendus sur le mois en cours avec barre de progression" },
    ],
  },
  {
    version: "1.4.0",
    date: "19 mai 2026",
    entries: [
      { type: "feat",  text: "Historique du stock : nouvelle page /stock/history affichant les commandes avec les déductions d'ingrédients par article" },
      { type: "feat",  text: "Panier commandes : bouton 'Vider tout' en haut à droite du panier" },
      { type: "feat",  text: "Panier commandes : miniature ronde de l'article sur chaque ligne" },
      { type: "feat",  text: "Panier commandes : nom de l'article affiché en entier (plus de texte coupé)" },
      { type: "feat",  text: "Historique commandes : filtres simplifiés — employé et semaine uniquement" },
      { type: "feat",  text: "Pagination 'Afficher plus' sur l'historique des commandes et l'historique du stock (10 par 10)" },
      { type: "feat",  text: "Notes de mise à jour : cette page, accessible à tous via l'icône carnet dans le header" },
      { type: "fix",   text: "Images des cartes articles (commandes, menu, stock) en object-contain — plus de zoom/recadrage" },
    ],
  },
  {
    version: "1.3.0",
    date: "18 mai 2026",
    entries: [
      { type: "fix",   text: "Semaine courante : les pages Dashboard, Ventes, Ventes produits se chargent maintenant sur la semaine locale du navigateur (correction décalage UTC/France)" },
      { type: "fix",   text: "Navigation semaine : le bouton suivant n'est plus bloqué à la semaine courante UTC" },
      { type: "fix",   text: "Années à 53 semaines ISO gérées correctement dans toutes les navigations" },
      { type: "fix",   text: "Commandes : weekNumber calculé depuis l'heure locale du navigateur (plus de commandes mal rattachées à la semaine précédente la nuit)" },
      { type: "fix",   text: "Dashboard : requêtes par weekNumber au lieu de plage createdAt UTC — cohérent avec le bilan" },
      { type: "fix",   text: "Bilan : rate limit relevé de 10 à 60 req/min + debounce 300 ms sur la navigation de semaine" },
    ],
  },
  {
    version: "1.2.0",
    date: "17 mai 2026",
    entries: [
      { type: "feat",  text: "Moteur de recherche global : barre permanente dans le header — trouve employés, articles, factures et commandes" },
      { type: "feat",  text: "Notifications in-app : cloche dans la sidebar avec badge, alertes stock bas et factures en retard, dismiss individuel ou global" },
      { type: "feat",  text: "Types d'imposition configurables dans le panel admin : Type 1, Type 2, Type 3 (défaut) et personnalisé (tranches libres)" },
      { type: "feat",  text: "Webhook alerte stock bas : URL configurable dans les paramètres, envoi Discord embed ou JSON générique" },
      { type: "fix",   text: "Page et API stock : respects les rôles d'accès personnalisés (plus de blocage pour les utilisateurs avec droit stock ajouté manuellement)" },
    ],
  },
  {
    version: "1.1.0",
    date: "17 mai 2026",
    entries: [
      { type: "feat",  text: "Gestion du stock : ajout / modification / suppression d'ingrédients avec quantité, seuil d'alerte et image" },
      { type: "feat",  text: "Recettes : association d'ingrédients aux articles du menu avec quantité par portion" },
      { type: "feat",  text: "Déduction automatique du stock à chaque commande confirmée selon les recettes" },
      { type: "feat",  text: "Badge 'Stock bas' sur les cartes ingrédients et bannière d'alerte sur la page stock" },
      { type: "feat",  text: "Sidebar : Bilan déplacé au-dessus de Liste des ventes dans la section Analyse" },
    ],
  },
  {
    version: "1.0.0",
    date: "Lancement initial",
    entries: [
      { type: "feat",  text: "Dashboard KPIs semaine/mois, navigation par semaine" },
      { type: "feat",  text: "Commandes avec panier, remises partenaires et cartes de fidélité, ajustement personnalisé" },
      { type: "feat",  text: "Menu : catégories, prix, coût de revient, images, disponibilité" },
      { type: "feat",  text: "Employés : gestion, grades (% salaire / dividende), reset mot de passe" },
      { type: "feat",  text: "Fiches de paie hebdomadaires par employé" },
      { type: "feat",  text: "Charges déductibles / non-déductibles, permanentes ou ponctuelles" },
      { type: "feat",  text: "Factures fournisseurs avec statut (en attente / payée / en retard)" },
      { type: "feat",  text: "Partenaires et cartes de fidélité avec remises" },
      { type: "feat",  text: "Bilan hebdomadaire complet avec export HTML" },
      { type: "feat",  text: "Analyse des ventes par semaine/produit" },
      { type: "feat",  text: "Paramètres : devise, logo, taux prime/dividende, webhook bilan" },
      { type: "feat",  text: "Panel Super Admin : gestion des restaurants, logs d'audit en temps réel" },
      { type: "feat",  text: "Sécurité : rate limiting, lockout compte, CSRF, SSRF, audit logs" },
      { type: "feat",  text: "Rôles d'accès personnalisés par utilisateur (OWNER uniquement)" },
    ],
  },
]

const badgeMap = {
  feat:  { label: "Nouveau",     className: "bg-primary/10 text-primary border-primary/20",          icon: Plus },
  fix:   { label: "Correction",  className: "bg-amber-500/10 text-amber-500 border-amber-500/20",    icon: Wrench },
  perf:  { label: "Performance", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Zap },
}

export default async function PatchNotesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <NotebookPen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes de mise à jour</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Historique des évolutions de RestoCompta</p>
        </div>
      </div>

      <div className="space-y-6">
        {NOTES.map(release => (
          <div key={release.version} className="relative pl-6 border-l-2 border-border">
            <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-sm font-bold text-primary">v{release.version}</span>
              <span className="text-xs text-muted-foreground">{release.date}</span>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {release.entries.map((entry, i) => {
                  const b = badgeMap[entry.type as keyof typeof badgeMap] ?? badgeMap.feat
                  const Icon = b.icon
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${b.className}`}>
                        <Icon className="h-2.5 w-2.5" />{b.label}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{entry.text}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
