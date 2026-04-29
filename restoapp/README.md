# RestoManager

SaaS de gestion d'établissement (restaurant, bar) — développé avec Next.js 14, Auth.js v5, Prisma et MariaDB.

---

## Stack technique

- **Frontend / Backend** : Next.js 14 App Router (TypeScript)
- **Auth** : Auth.js v5 (sessions JWT)
- **ORM** : Prisma
- **Base de données** : MariaDB
- **Styles** : Tailwind CSS
- **Déploiement** : PM2 sur VPS

---

## Installation locale

### 1. Prérequis

- Node.js 18+
- MariaDB 10.6+
- npm

### 2. Cloner et installer

```bash
git clone <votre-repo>
cd restoapp
npm install
```

### 3. Variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/restoapp"
AUTH_SECRET="votre-secret-aleatoire-ici"
NEXTAUTH_URL="http://localhost:3000"
```

Générer un secret sécurisé :

```bash
openssl rand -base64 32
```

### 4. Base de données

```bash
# Créer la BDD dans MariaDB
mysql -u root -p -e "CREATE DATABASE restoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Pousser le schéma Prisma
npm run db:push

# Seeder les données de démo
npm run db:seed
```

### 5. Lancer en développement

```bash
npm run dev
```

Accès : http://localhost:5555

Comptes de démo :
- Patron : `patron@resto.com` / `admin123`
- Employé : `employe@resto.com` / `emp123`

---

## Déploiement sur VPS (Ubuntu)

### 1. Installer les dépendances système

```bash
# Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# PM2
npm install -g pm2

# MariaDB
sudo apt update
sudo apt install mariadb-server -y
sudo mysql_secure_installation
```

### 2. Configurer MariaDB

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE restoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restouser'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise';
GRANT ALL PRIVILEGES ON restoapp.* TO 'restouser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Déployer l'application

```bash
# Copier les fichiers sur le VPS (depuis votre machine)
scp -r ./ user@votre-vps:/var/www/restoapp

# Sur le VPS
cd /var/www/restoapp
npm install
```

Créer le fichier `.env` :

```bash
nano .env
```

```env
DATABASE_URL="mysql://restouser:VotreMotDePasseSecurise@localhost:3306/restoapp"
AUTH_SECRET="votre-secret-genere-avec-openssl"
NEXTAUTH_URL="https://votre-domaine.com"
NODE_ENV="production"
```

### 4. Build et démarrage

```bash
# Pousser le schéma
npm run db:push

# Seeder
npm run db:seed

# Build production
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx (reverse proxy)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/restoapp
```

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
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/restoapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. HTTPS avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com
```

---

## Structure du projet

```
restoapp/
├── prisma/
│   ├── schema.prisma       # Schéma MariaDB complet
│   └── seed.ts             # Données de démo
├── src/
│   ├── app/
│   │   ├── (auth)/login/   # Page de connexion
│   │   ├── (dashboard)/    # Pages protégées
│   │   │   ├── dashboard/  # Tableau de bord
│   │   │   ├── employees/  # Gestion employés
│   │   │   ├── menu/       # Carte
│   │   │   ├── orders/     # Commandes
│   │   │   ├── suppliers/  # Fournisseurs
│   │   │   ├── invoices/   # Factures
│   │   │   ├── payroll/    # Payes
│   │   │   └── settings/   # Paramètres
│   │   └── api/            # Routes API REST
│   ├── components/
│   │   ├── auth/           # Formulaire de connexion
│   │   ├── dashboard/      # Dashboards patron + employé
│   │   ├── employees/      # Gestion des employés
│   │   ├── menu/           # Carte
│   │   ├── orders/         # Prise de commandes + historique
│   │   ├── suppliers/      # Fournisseurs
│   │   ├── invoices/       # Factures
│   │   ├── payroll/        # Payes
│   │   ├── settings/       # Paramètres
│   │   ├── layout/         # Sidebar, Header, ThemeProvider
│   │   └── ui/             # Modal, Toaster
│   ├── lib/
│   │   ├── auth.ts         # Config Auth.js v5
│   │   ├── prisma.ts       # Client Prisma singleton
│   │   └── utils.ts        # Helpers (formatCurrency, dates...)
│   ├── middleware.ts        # Protection des routes
│   └── types/
│       └── next-auth.d.ts  # Types session étendus
├── ecosystem.config.js     # Config PM2
├── .env.example
└── README.md
```

---

## Rôles et permissions

| Fonctionnalité         | OWNER | MANAGER | EMPLOYEE |
|------------------------|:-----:|:-------:|:--------:|
| Dashboard complet      | ✅    | ✅      | —        |
| Dashboard personnel    | —     | —       | ✅       |
| Gestion employés       | ✅    | ✅      | —        |
| Gestion grades         | ✅    | ✅      | —        |
| Carte (lecture)        | ✅    | ✅      | ✅       |
| Carte (écriture)       | ✅    | ✅      | —        |
| Prise de commandes     | —     | —       | ✅       |
| Logs commandes         | ✅    | ✅      | —        |
| Fournisseurs           | ✅    | ✅      | —        |
| Factures               | ✅    | ✅      | —        |
| Générer les payes      | ✅    | ✅      | —        |
| Voir ses payes         | —     | —       | ✅       |
| Paramètres             | ✅    | —       | —        |

---

## Commandes utiles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Démarrer en production
npm run db:push      # Pousser le schéma Prisma
npm run db:seed      # Seeder la base de données
npm run db:studio    # Interface Prisma Studio

# PM2
pm2 status           # Statut de l'app
pm2 logs restoapp    # Logs en temps réel
pm2 restart restoapp # Redémarrer
pm2 stop restoapp    # Arrêter
```

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds)
- Sessions **JWT** signées avec `AUTH_SECRET`
- **Middleware** de protection sur toutes les routes
- Isolation **multi-tenant** : chaque restaurant ne voit que ses données
- Validation des entrées avec **Zod** sur toutes les routes API
- Vérification du `restaurantId` sur chaque requête API
