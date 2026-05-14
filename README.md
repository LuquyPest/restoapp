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
| Menu | Carte avec catégories, prix, coût de revient, images |
| Employés | Gestion, grades (% salaire / dividende), suppression de grade, reset mot de passe |
| Fiche de paie | Génération des payes hebdomadaires par employé |
| Charges | Déductibles / non-déductibles, permanentes ou ponctuelles |
| Factures | Suivi fournisseurs avec statut (en attente / payée / en retard) |
| Partenaires | Remises par partenaire (non cumulable avec carte de fidélité) |
| Cartes de fidélité | Remises client avec date d'expiration |
| Bilan hebdomadaire | Compte de résultat complet, export HTML identique au rapport affiché |
| Analyse des ventes | CA par semaine/produit, historique |
| Paramètres | Taux (prime, dividende), devise, logo personnalisé (URL), webhook |
| Webhook | Envoi automatique du bilan HTML en pièce jointe (Discord ou POST JSON) |
| Super Admin | Gestion des restaurants, logs d'audit en temps réel par restaurant |

---

## Rôles et permissions

| Fonctionnalité | OWNER | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|
| Dashboard complet | ✅ | ✅ | — |
| Dashboard personnel | — | — | ✅ |
| Gestion employés & grades | ✅ | ✅ | — |
| Menu (lecture + écriture) | ✅ | ✅ | ✅ (lecture) |
| Commandes | ✅ | ✅ | ✅ |
| Fiche de paie (générer) | ✅ | ✅ | — |
| Fiche de paie (ses payes) | — | — | ✅ |
| Charges, factures, fournisseurs | ✅ | ✅ | — |
| Partenaires, fidélité | ✅ | ✅ | — |
| Bilan, analyses | ✅ | — | — |
| Paramètres | ✅ | — | — |

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
│   ├── schema.prisma         # Schéma (19 modèles)
│   └── seed.ts               # Données de démo
├── public/
│   └── logo.png              # Logo de l'application
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Page de connexion
│   │   ├── (dashboard)/      # Pages protégées
│   │   ├── (admin)/admin/    # Interface super-admin
│   │   └── api/              # Routes API REST
│   ├── components/           # Composants React par module
│   ├── lib/
│   │   ├── auth.ts           # Config Auth.js v5 + lockout compte
│   │   ├── prisma.ts         # Client Prisma singleton
│   │   ├── utils.ts          # Helpers partagés (dates, calculs, formatage)
│   │   ├── logger.ts         # Audit logs asynchrones
│   │   ├── rate-limit.ts     # Rate limiting persisté en base
│   │   ├── report-html.ts    # Générateur HTML bilan hebdomadaire
│   │   ├── webhook-payload.ts# Construction + envoi webhook
│   │   └── page-access.ts    # Contrôle d'accès par page/rôle
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
| Élévation de privilèges | Rôle vérifié (`OWNER`/`MANAGER`/`EMPLOYEE`) sur chaque endpoint |
| SSRF webhook | Blocage IPs privées/localhost + forçage HTTPS sur l'URL webhook |
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
