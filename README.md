# Moodly

Application mobile de suivi du moral des salariés (mood tracking), réalisée dans le cadre du projet Moodly (RSE).

**Contexte :** d'après l'ORSE, 34 % des salariés français seraient en burn-out et la moitié pensent que leur entreprise ne prend pas assez en compte la détresse psychologique au travail. L'idée de Moodly est de permettre aux salariés de donner leur humeur tous les jours en quelques secondes, de façon anonyme, et de donner aux managers une vue d'ensemble de leur équipe pour pouvoir réagir.

Il s'agit d'un MVP : on a gardé seulement l'essentiel.

## Fonctionnalités

- Connexion avec gestion des droits (2 rôles : **employé** et **manager**)
- **Employé** : saisie de l'humeur du jour (5 niveaux) + facteurs facultatifs (tags), modifiable dans la journée, petit historique de la semaine
- **Manager** : peut aussi saisir son humeur + **vue équipe sur les 30 derniers jours** :
  - moral moyen, taux de participation, tendance par rapport à la semaine précédente
  - un graphique de l'évolution du moral (avec un seuil d'alerte à 2,5)
  - les facteurs les plus cités et des alertes simples (moral bas, baisse, participation faible)
- Application Android générée avec Capacitor

## Stack technique

| Partie | Techno |
| --- | --- |
| Back | Strapi 5 (headless CMS, Node.js) + SQLite |
| Front | VueJS 3 + Vite, Vue Router, Pinia, Chart.js (vue-chartjs) |
| Mobile | CapacitorJS 8 (Android) + plugin Preferences pour stocker le token |

## Anonymat et données personnelles

C'était le point le plus important du sujet (gestion des risques) :

- La table `moods` ne contient **pas l'id de l'utilisateur**. On stocke un hash HMAC-SHA256 de l'id avec un secret (`MOOD_HASH_SECRET`). Ça permet de retrouver « mon humeur du jour » mais pas de savoir à qui appartient une humeur sans le secret.
- Il n'y a **aucune route pour lister les humeurs**. Le manager reçoit uniquement des moyennes calculées par le serveur.
- Une moyenne n'est affichée que s'il y a **au moins 3 réponses** (`MIN_GROUP_SIZE`). Si l'équipe fait moins de 3 personnes, aucune stat n'est affichée.
- Pas de champ commentaire libre : un texte peut facilement permettre de reconnaître quelqu'un.
- L'inscription publique est désactivée : les comptes sont créés par l'entreprise.
- Les droits sont vérifiés côté serveur (permissions Strapi par rôle + une policy `is-manager` sur la route des stats), pas seulement dans le front.

Limites connues : un administrateur Strapi peut voir la table des humeurs (hash, score, date). En production il faudrait limiter l'accès à l'admin, passer en HTTPS, définir une durée de conservation et informer les salariés (RGPD).

## Installation

Prérequis : Node.js 22 ou plus. Pour l'application Android : Android Studio.

### 1. Backend (Strapi)

```bash
cd backend
npm install
cp .env.example .env
npm run develop
```

- API : http://localhost:1337/api
- Admin Strapi : http://localhost:1337/admin (`admin@moodly.demo` / `Moodly2026!`)

Au premier lancement, les rôles Employé / Manager sont créés avec leurs permissions et, si `SEED_DEMO=true`, des données de démo sont ajoutées (2 équipes, 11 comptes, 30 jours d'humeurs).

### 2. Frontend (Vue)

Dans un deuxième terminal :

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application est sur http://localhost:5173 (mettre le navigateur en mode mobile, c'est fait pour un téléphone).

### 3. Application Android (Capacitor)

1. Le PC et le téléphone doivent être sur le même réseau wifi.
2. Récupérer l'IP du PC (`ipconfig` sur Windows), par exemple `192.168.1.20`.
3. Dans `frontend/.env`, mettre `VITE_API_URL=http://192.168.1.20:1337` (on peut aussi changer l'adresse dans l'app avec « Paramètres du serveur » sur l'écran de connexion).
4. Lancer :

```bash
cd frontend
npm run android
```

Cette commande build le front, copie les fichiers dans le projet Android (`cap sync`) et ouvre Android Studio. Ensuite il suffit de cliquer sur Run avec le téléphone branché (mode développeur activé).

Si le téléphone n'arrive pas à se connecter, vérifier que le pare-feu Windows autorise le port 1337.

## Comptes de démo

Mot de passe pour tous les comptes : `Moodly2026!`

| Email | Rôle | Équipe |
| --- | --- | --- |
| manager@moodly.demo | Manager | Équipe Produit |
| employe@moodly.demo | Employé | Équipe Produit |
| manager.support@moodly.demo | Manager | Équipe Support |
| ines@, lucas@, emma@, hugo@, lea@moodly.demo | Employé | Équipe Produit |
| nina@, tom@, sofia@moodly.demo | Employé | Équipe Support |

Sur l'écran de connexion, les liens « Employé » et « Manager » remplissent automatiquement les champs.

Si l'admin Strapi ne se construit pas sur Windows (erreur « Failed to load native binding »), on peut lancer l'API sans l'interface admin : `npx strapi develop --no-watch-admin --no-build-admin`. Pour avoir l'admin, il faut installer le [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).

## Utilisation

**En tant qu'employé :**
1. Se connecter.
2. Choisir son humeur parmi les 5 niveaux (de « Très mal » à « Très bien »).
3. Choisir jusqu'à 3 facteurs si on veut (charge de travail, équipe, etc.).
4. Cliquer sur « Valider ». On peut modifier sa réponse jusqu'à la fin de la journée.

**En tant que manager :**
1. Se connecter : on arrive sur l'onglet « Mon équipe ».
2. Regarder les indicateurs et le graphique des 30 derniers jours.
3. Les alertes et les facteurs les plus cités aident à décider s'il faut faire un point avec l'équipe.
4. L'onglet « Mon humeur » permet de donner sa propre humeur.

## API

Toutes les routes demandent un token JWT (`Authorization: Bearer <jwt>`).

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/local` | public | Connexion (renvoie le JWT) |
| GET | `/api/me` | employé, manager | Infos de l'utilisateur connecté (rôle, équipe) |
| GET | `/api/tags` | employé, manager | Liste des facteurs |
| GET | `/api/moods/today` | employé, manager | Mon humeur du jour |
| PUT | `/api/moods/today` | employé, manager | Enregistrer / modifier mon humeur du jour : `{ "data": { "score": 4, "tags": ["<documentId>"] } }` |
| GET | `/api/moods/history?days=7` | employé, manager | Mon historique |
| GET | `/api/moods/team-stats?days=30` | manager | Stats anonymisées de l'équipe |

## Structure du projet

```
moodly/
├── backend/                     # Strapi
│   ├── config/                  # config (cors, jwt, base de données)
│   ├── src/
│   │   ├── api/
│   │   │   ├── mood/            # humeurs : content type, routes, controller, service
│   │   │   │   └── utils/       # calcul des stats + dates
│   │   │   ├── tag/             # facteurs (gérés dans l'admin)
│   │   │   ├── team/            # équipes
│   │   │   └── account/         # route /api/me
│   │   ├── bootstrap/           # rôles/permissions + données de démo
│   │   ├── extensions/          # ajout du champ team sur les users
│   │   └── policies/            # is-manager
│   └── tests/                   # tests unitaires (node --test)
└── frontend/                    # Vue + Capacitor
    ├── src/
    │   ├── views/               # Login, saisie humeur, vue équipe
    │   ├── components/          # graphique
    │   ├── stores/              # store Pinia (auth)
    │   ├── api.js               # appels à l'API
    │   └── router.js            # routes + gestion des droits
    ├── android/                 # projet Android généré par Capacitor
    └── capacitor.config.json
```

## Tests

```bash
cd backend
npm test
```

Les tests vérifient le calcul des statistiques (moyennes, masquage sous 3 réponses, tendance, tags).

## Pistes d'amélioration

- Notification de rappel chaque jour (plugin Capacitor Local Notifications)
- Un manager avec plusieurs équipes
- Vue RH globale pour toute l'entreprise
- Déploiement sur un serveur (PostgreSQL + HTTPS)
- Version iOS
