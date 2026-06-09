# RestoCompta

SaaS multi-tenant de gestion comptable et opérationnelle pour restaurants et bars.  
Développé avec Next.js 15, Auth.js v5, Prisma et MariaDB.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| Authentification | Auth.js v5 beta (JWT, 2h) |
| ORM | Prisma 5 |
| Base de données | MariaDB |
| Styles | Tailwind CSS + shadcn/ui (Radix) |
| Validation | Zod v4 |
| Déploiement | Docker + Traefik sur VPS |

---

## Fonctionnalités

| Module | Description |
|---|---|
| Dashboard | KPIs semaine/mois, CA vs semaine précédente, bénéfice hebdomadaire |
| Commandes | Prise de commandes avec panier (quantité saisie à la main), historique filtrable |
| Menu | Carte avec catégories, prix, coût de revient, images, recettes liées au stock |
| Stock | Gestion des ingrédients (quantité, seuil d'alerte, image), déduction automatique à la vente |
| Employés | Gestion, grades (% salaire / dividende), suppression de grade, reset mot de passe |
| Fiche de paie | Génération des payes hebdomadaires par employé |
| Charges | Déductibles / non-déductibles, permanentes ou ponctuelles |
| Factures | Suivi fournisseurs avec statut (en attente / payée / en retard) |
| Partenaires | Remises par partenaire (non cumulable avec carte de fidélité) |
| Cartes de fidélité | Remises client avec date d'expiration |
| Bilan hebdomadaire | Compte de résultat complet, export HTML identique au rapport affiché |
| Analyse des ventes | CA par semaine/produit, historique |
| Recherche globale | Barre de recherche fixe dans le header (employés, articles, factures, commandes) |
| Notifications | Alertes persistantes en base : stock bas + factures en retard, dismiss individuel ou global |
| Paramètres | Taux (prime, dividende), devise, logo (URL), webhook hebdomadaire, webhook alerte stock |
| Webhook | Bilan HTML en pièce jointe (Discord ou POST JSON) + alertes stock bas |
| Super Admin | Gestion des restaurants, type d'imposition par restaurant, logs d'audit en temps réel |

---

## Rôles et permissions

| Fonctionnalité | OWNER | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|
| Dashboard complet | ✅ | ✅ | — |
| Dashboard personnel | — | — | ✅ |
| Gestion employés & grades | ✅ | ✅ | — |
| Menu (lecture + écriture) | ✅ | ✅ | ✅ (lecture) |
| Recettes & stock (écriture) | ✅ | — | — |
| Stock (lecture/écriture) | ✅ | — | — |
| Commandes | ✅ | ✅ | ✅ |
| Fiche de paie (générer) | ✅ | ✅ | — |
| Fiche de paie (ses payes) | — | — | ✅ |
| Charges, factures, fournisseurs | ✅ | ✅ | — |
| Partenaires, fidélité | ✅ | ✅ | — |
| Bilan, analyses | ✅ | — | — |
| Paramètres | ✅ | — | — |
| Notifications (stock + factures) | ✅ | ✅ | — |
| Recherche globale | ✅ | ✅ | ✅ |
| Rôles d'accès personnalisés | ✅ | — | — |

---

## Déploiement

### Prérequis

- Docker 24+
- Docker Compose v2
- Traefik configuré sur le serveur avec un réseau externe `proxy`

### 1. Variables d'environnement

Créer un fichier `.env` à la racine :

```env
DB_ROOT_PASSWORD=rootpassword
DB_NAME=restoapp
DB_USER=restoapp
DB_PASSWORD=restopassword

AUTH_SECRET=           # openssl rand -base64 32
NEXTAUTH_URL=https://votre-domaine.com
AUTH_TRUST_HOST=true

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
CRON_SECRET=           # openssl rand -base64 32
```

### 2. Lancer

```bash
docker compose up -d --build
```

Au démarrage, le conteneur :
1. Applique automatiquement le schéma Prisma
2. Crée le compte SUPERADMIN depuis `ADMIN_EMAIL` / `ADMIN_PASSWORD` s'il n'existe pas encore

### 3. Traefik

Le `docker-compose.yml` est préconfiguré pour Traefik avec Let's Encrypt. Adapter le label `traefik.http.routers.restoapp.rule` et `NEXTAUTH_URL` à votre domaine.

### 4. Cron webhook (optionnel)

```bash
# Toutes les heures — envoie uniquement aux restaurants configurés pour ce jour/heure
0 * * * * curl -s -X POST https://votre-domaine.com/api/cron/weekly-report \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

## Développement local

### Prérequis

- Node.js 20+
- MariaDB 10.6+ ou MySQL 8+

### Installation

```bash
git clone <votre-repo>
cd restoapp
npm install
```

Créer un fichier `.env` :

```env
DATABASE_URL="mysql://restoapp:MOT_DE_PASSE@localhost:3306/restoapp"
AUTH_SECRET="secret-aleatoire-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="votre-mot-de-passe-admin"
CRON_SECRET="secret-pour-le-cron-webhook"
```

```bash
npm run db:push
npm run dev
```

---

## Commandes Docker

```bash
# Rebuild et redémarrer
docker compose up -d --build

# Redémarrer sans rebuild
docker compose up -d

# Voir les logs
docker compose logs -f

# Arrêter
docker compose down

# Arrêter et supprimer les données
docker compose down -v
```

> Le volume `db_data` persiste la base de données. Ne pas le supprimer sans sauvegarde préalable.

---

## Structure du projet

```
restoapp/
├── prisma/
│   ├── schema.prisma         # Schéma (22 modèles)
│   └── seed.ts               # Données de démo
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Page de connexion
│   │   ├── (dashboard)/      # Pages protégées
│   │   ├── (admin)/admin/    # Interface super-admin
│   │   └── api/              # Routes API REST
│   ├── components/
│   └── lib/
│       ├── auth.ts           # Config Auth.js v5 + lockout compte
│       ├── prisma.ts         # Client Prisma singleton
│       ├── logger.ts         # Audit logs asynchrones
│       ├── rate-limit.ts     # Rate limiting persisté en base
│       ├── notifications.ts  # Alertes stock et factures
│       ├── report-html.ts    # Générateur HTML bilan hebdomadaire
│       └── webhook-payload.ts# Construction + envoi webhook
└── create-admin.mjs          # Init SUPERADMIN au démarrage
```

---

## Sécurité

| Menace | Protection |
|---|---|
| Bruteforce login | Rate limit 5 req/min par IP (DB) + lockout compte 15 min après 5 échecs |
| CSRF | Vérification exacte de l'origine (`NEXTAUTH_URL`) sur toutes les mutations |
| Injection SQL | Prisma uniquement (requêtes préparées, zéro SQL brut) |
| Accès non autorisé | JWT 2h + vérification `restaurantId` sur chaque requête API |
| Élévation de privilèges | Rôle vérifié (`OWNER`/`MANAGER`/`EMPLOYEE`) + rôles d'accès personnalisés |
| SSRF webhook | Blocage IPs privées/localhost + forçage HTTPS sur toutes les URLs webhook |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` (CSP) |
| Transport | `HSTS` max-age 2 ans avec preload |
| Audit | Logs de toutes les actions sensibles avec IP, email, métadonnées |

---

## Types d'imposition

Configurables par restaurant depuis le panel Super Admin.

| Type | Tranches |
|---|---|
| **Type 1** | $1–$1 000 000 : 35% · Au-delà : 45% |
| **Type 2** | $0–$100 000 : 0% · $100 001–$1 000 000 : 30% · Au-delà : 40% |
| **Type 3** (défaut) | $0–$50 000 : 0% · $50 001–$100 000 : 20% · $100 001–$500 000 : 30% · Au-delà : 40% |
| **Personnalisé** | Tranches libres (min / max / taux %) ajoutables dans l'admin |
