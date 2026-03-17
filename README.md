# 🐾 Socket Chat & Memory Game — Monorepo

Ce projet est un monorepo moderne regroupant deux applications :

- **Un chat en temps réel** (Socket Chat)
- **Un mini-jeu Memory** développé en TDD dans le cadre du diplôme CDA

---

## 🛠️ Stack technique

### Chat
- **Next.js** (App Router, Server Actions)
- **React** (frontend)
- **Socket.IO** (temps réel)
- **Prisma** + **PostgreSQL** (ORM & base de données)
- **Tailwind CSS** & **Shadcn UI** (UI moderne)
- **Zustand** (state management)
- **next-i18next** (i18n)
- **Stripe** (paiement, si besoin)

### Memory Game
- **Vitest** (tests unitaires, TDD)
- **TypeScript** (typage strict)

### Commun
- **pnpm** (gestionnaire de monorepo)
- **TypeScript** (typage strict)

---

## 📦 Structure du monorepo

```
/Front      # Frontend Next.js/React (Chat)
/Back       # Backend Node.js/Express/Socket.IO
/Test       # Logique métier du jeu Memory + tests Vitest
pnpm-workspace.yaml
package.json (racine)
```

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Lancer le backend

```bash
pnpm dev:back
```

### 3. Lancer le frontend

```bash
pnpm dev:front
```

### 4. Lancer les deux en même temps

```bash
pnpm dev
```

### 5. Lancer les tests du jeu Memory

```bash
pnpm test
```

---

## 🛠️ Scripts utiles

| Commande | Description |
|----------|-------------|
| `pnpm dev:front` | Démarre le frontend Next.js |
| `pnpm dev:back` | Démarre le backend Express/Socket.IO |
| `pnpm dev` | Lance tout le monorepo en mode dev |
| `pnpm test` | Exécute les tests unitaires du jeu Memory |
| `pnpm --filter test-game test:watch` | Tests en mode watch |
| `pnpm --filter test-game test:coverage` | Rapport de couverture |
| `pnpm add <pkg> --filter front` | Ajoute un package au frontend |
| `pnpm add <pkg> --filter back` | Ajoute un package au backend |

---

## 🖥️ Frontend — Socket Chat (Next.js)

- App Router (`/app`)
- Server Actions pour la logique serveur
- Authentification JWT sécurisée (cookie httpOnly)
- Zustand pour le state global
- Tailwind CSS + Shadcn UI pour l'UI
- next-i18next pour l'internationalisation
- Dark/Light mode avec persistance
- Axios pour les requêtes HTTP

## ⚡ Backend — Socket Chat (Express/Socket.IO)

- Socket.IO pour le chat temps réel (rooms, messages globaux)
- Prisma pour l'accès PostgreSQL
- Sécurité : validation Zod, headers, CORS, CSRF, XSS
- Stripe (paiement sécurisé, webhooks)

## 🗄️ Base de données

- PostgreSQL (local ou cloud)
- Modélisation via Prisma (`/Back/prisma/schema.prisma`)

## 🌍 Internationalisation

- next-i18next, fichiers JSON par langue dans `/Front/public/locales/`

---

## 🃏 Jeu Memory — TDD (CDA)

> Projet réalisé dans le cadre du diplôme **Concepteur Développeur d'Applications**.
> Objectif : appliquer la méthodologie **Test Driven Development** sur la logique métier d'un mini-jeu.

### Règles du jeu

- Le plateau contient des cartes retournées **face cachée**
- Le joueur retourne **deux cartes** à chaque tour
- Si elles affichent le **même symbole** → elles sont définitivement **trouvées**
- Si elles sont **différentes** → elles reviennent **face cachée**
- Une carte déjà trouvée **ne peut plus être retournée**
- La partie est **gagnée** quand toutes les paires ont été trouvées

### Logique métier (`/Test/src/memory.ts`)

| Fonction | Description |
|----------|-------------|
| `createBoard(symbols)` | Crée un plateau avec des paires de cartes |
| `flipCard(board, id)` | Retourne une carte face visible |
| `checkMatch(board, id1, id2)` | Vérifie si deux cartes forment une paire |
| `isGameWon(board)` | Vérifie si toutes les paires ont été trouvées |

### Démarche TDD appliquée

Le développement a suivi le cycle **Red → Green → Refactor** :

1. **Red** — Écriture d'un test décrivant un comportement attendu, qui échoue
2. **Green** — Implémentation du minimum de code pour faire passer le test
3. **Refactor** — Amélioration du code sans casser les tests existants

Chaque règle métier a été introduite par un test **avant** son implémentation.
La logique est entièrement **isolée** de l'interface et du réseau.

> Voir `JOURNAL_ITERATION.md` pour le détail de chaque itération.

---

## 🎨 UI/UX

- Composants réutilisables, typés, sans logique métier dans le JSX
- Responsive, dark/light mode, accessibilité

## 🔒 Sécurité

- JWT en cookie httpOnly, jamais accessible côté client
- Validation et sanitation de toutes les entrées
- Headers de sécurité (CSP, etc.)
- CSRF sur les formulaires
- Jamais d'erreur technique exposée côté client

## 💡 Bonnes pratiques

- Utiliser pnpm partout (pas de npm/yarn)
- Ajouter les dépendances avec `--filter front` ou `--filter back`
- Logique métier isolée, composants purs
- Utiliser les hooks Zustand pour le state
- Protéger les routes sensibles côté serveur

---

## 📚 Documentation

- Voir `/Front/explication.md` pour un guide Socket.IO détaillé
- Voir `/Back/server.js` pour la logique temps réel
- Voir `JOURNAL_ITERATION.md` pour le journal de développement TDD du Memory

---

**Développé pour l'apprentissage et la collaboration.**

N'hésitez pas à contribuer ou à poser vos questions ! 🚀