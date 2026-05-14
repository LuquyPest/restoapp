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
| Base de données | MariaDB / MySQL |
| Styles | Tailwind CSS + shadcn/ui (Radix) |
| Validation | Zod v4 |
| Déploiement | PM2 sur VPS Ubuntu + Nginx + Let's Encrypt |

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

## Installation locale

### 1. Prérequis

- Node.js 20+
- MariaDB 10.6+ ou MySQL 8+
- npm

### 2. Cloner et installer

```bash
git clone <votre-repo>
cd restoapp
npm install
```

### 3. Variables d'environnement

```bash
cp envexemple .env
```

Éditer `.env` :

```env
DATABASE_URL="mysql://restoapp:MOT_DE_PASSE@localhost:3306/restoapp"
AUTH_SECRET="secret-aleatoire-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="production"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="votre-mot-de-passe-admin"
CRON_SECRET="secret-pour-le-cron-webhook"
```

Générer des secrets sécurisés :

```bash
openssl rand -base64 32
```

### 4. Base de données

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE restoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restoapp'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES
  ON restoapp.* TO 'restoapp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
npm run db:push
```

### 5. Lancer en développement

```bash
npm run dev
```

---

## Déploiement sur VPS (Ubuntu)

### 1. Dépendances système

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
npm install -g pm2
sudo apt update && sudo apt install mariadb-server nginx -y
sudo mysql_secure_installation
```

### 2. Déployer

```bash
git clone <votre-repo> ~/restoapp
cd ~/restoapp
npm install
cp envexemple .env
# Éditer .env avec vos valeurs
npm run build
```

### 3. PM2

```bash
pm2 start npm --name restoapp -- start -- -p 5555
pm2 save
pm2 startup   # Suivre les instructions affichées
```

### 4. Nginx

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:5555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/restoapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d votre-domaine.com
```

### 5. Cron webhook (optionnel)

```bash
# Toutes les heures — le cron envoie uniquement aux restaurants configurés
# pour ce jour/heure précis
0 * * * * curl -s -X POST https://votre-domaine.com/api/cron/weekly-report \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

## Structure du projet

```
restoapp/
├── prisma/
│   ├── schema.prisma         # Schéma (22 modèles)
│   └── seed.ts               # Données de démo
├── public/
│   └── logo.png              # Logo de l'application
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Page de connexion
│   │   ├── (dashboard)/      # Pages protégées (dont /stock)
│   │   ├── (admin)/admin/    # Interface super-admin
│   │   └── api/              # Routes API REST
│   ├── components/
│   │   ├── layout/           # Sidebar (notifications + cloche), SearchBar
│   │   └── ...               # Composants par module
│   ├── lib/
│   │   ├── auth.ts           # Config Auth.js v5 + lockout compte
│   │   ├── prisma.ts         # Client Prisma singleton
│   │   ├── utils.ts          # Helpers partagés + calculateTax multi-type
│   │   ├── logger.ts         # Audit logs asynchrones
│   │   ├── rate-limit.ts     # Rate limiting persisté en base
│   │   ├── notifications.ts  # Création/check notifications (stock, factures)
│   │   ├── report-html.ts    # Générateur HTML bilan hebdomadaire
│   │   ├── webhook-payload.ts# Construction + envoi webhook
│   │   ├── page-access.ts    # Contrôle d'accès par page/rôle
│   │   └── page-permissions.ts # Pages configurables pour rôles personnalisés
│   └── middleware.ts         # Auth + CSRF + rate limit login
└── next.config.js            # Headers sécurité, packages serveur
```

---

## Sécurité

### Mesures en place

| Menace | Protection |
|---|---|
| Bruteforce login | Rate limit 5 req/min par IP (DB) + lockout compte 15 min après 5 échecs |
| CSRF | Vérification exacte de l'origine (`NEXTAUTH_URL`) sur toutes les mutations |
| Injection SQL | Prisma uniquement (requêtes préparées, zéro SQL brut) |
| Accès non autorisé | JWT 2h + vérification `restaurantId` sur chaque requête API |
| Élévation de privilèges | Rôle vérifié (`OWNER`/`MANAGER`/`EMPLOYEE`) + rôles d'accès personnalisés |
| SSRF webhook | Blocage IPs privées/localhost + forçage HTTPS sur toutes les URLs webhook |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` (CSP) |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Transport | `HSTS` max-age 2 ans avec preload |
| Suppression données | Soft delete sur MenuItem, Invoice, Charge |
| Audit | Logs de toutes les actions sensibles avec IP, email, métadonnées |
| Dépendances | Aucun package inutilisé, surface d'attaque minimale |

### Actions à faire en production

```bash
# 1. AUTH_SECRET unique et aléatoire
openssl rand -base64 32   # Mettre la valeur dans .env

# 2. ADMIN_PASSWORD fort et unique dans .env

# 3. Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Types d'imposition

Configurables par restaurant depuis le panel Super Admin (création ou modification).

| Type | Tranches |
|---|---|
| **Type 1** | $1–$1 000 000 : 35% · Au-delà : 45% |
| **Type 2** | $0–$100 000 : 0% · $100 001–$1 000 000 : 30% · Au-delà : 40% |
| **Type 3** (défaut) | $0–$50 000 : 0% · $50 001–$100 000 : 20% · $100 001–$500 000 : 30% · Au-delà : 40% |
| **Personnalisé** | Tranches libres (min / max / taux %) ajoutables et modifiables dans l'admin |

Le calcul est appliqué automatiquement dans le bilan hebdomadaire et le webhook.

---

## Commandes utiles

```bash
# Développement
npm run dev

# Production
npm run build && pm2 restart restoapp

# Base de données
npm run db:push     # Pousser le schéma Prisma
npm run db:studio   # Interface Prisma Studio

# PM2
pm2 status
pm2 logs restoapp
pm2 restart restoapp
```
