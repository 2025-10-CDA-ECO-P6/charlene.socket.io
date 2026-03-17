# Socket Chat & Memory Game — Monorepo

Ce projet est un monorepo regroupant deux applications :

- **Un chat en temps réel** avec rooms (Socket.IO)
- **Un mini-jeu Memory** développé en TDD dans le cadre du diplôme CDA

---

## Stack technique

### Frontend (`/Front`)
- **React 19** + **React Router v7** (SSR)
- **Socket.IO Client** (temps réel)
- **Tailwind CSS v4** (UI)
- **Recharts** (graphiques)
- **TypeScript**

### Backend (`/Back`)
- **Node.js** + **Express v5**
- **Socket.IO v4** (rooms, messages globaux, compteur de connexions)
- **CORS** configuré pour le local et Render

### Tests (`/Test`)
- **Vitest** (tests unitaires, TDD)
- **TypeScript**

### Commun
- **pnpm** (gestionnaire de monorepo)
- **Render** (déploiement via Blueprint — `render.yaml`)

---

## Structure du monorepo

```
/Front      # Frontend React Router v7
/Back       # Backend Node.js/Express/Socket.IO
/Test       # Logique métier du jeu Memory + tests Vitest
render.yaml             # Blueprint Render (déploiement automatisé)
pnpm-workspace.yaml
package.json (racine)
```

---

## Démarrage rapide

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

## Scripts utiles

| Commande | Description |
|----------|-------------|
| `pnpm dev:front` | Démarre le frontend React Router |
| `pnpm dev:back` | Démarre le backend Express/Socket.IO |
| `pnpm dev` | Lance tout le monorepo en mode dev |
| `pnpm test` | Exécute les tests unitaires du jeu Memory |
| `pnpm --filter test-game test:watch` | Tests en mode watch |
| `pnpm --filter test-game test:coverage` | Rapport de couverture |
| `pnpm add <pkg> --filter front` | Ajoute un package au frontend |
| `pnpm add <pkg> --filter back` | Ajoute un package au backend |

---

## Backend — Socket Chat

Le serveur écoute sur `process.env.PORT` (ou 3000 en local) et expose les événements Socket.IO suivants :

| Événement (reçu) | Description |
|------------------|-------------|
| `join_room` | Rejoindre une room |
| `leave_room` | Quitter une room |
| `room_message` | Envoyer un message dans une room |
| `chat message` | Message global (broadcast à tous) |

| Événement (émis) | Description |
|------------------|-------------|
| `users count` | Nombre d'utilisateurs connectés |
| `room_message` | Message dans une room (avec horodatage) |
| `chat message` | Message global (avec horodatage) |

---

## Frontend — Routes

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/chat` | Chat global en temps réel |
| `/memory` | Jeu Memory |
| `/:roomId` | Chat dans une room spécifique |

---

## Jeu Memory — TDD (CDA)

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

## Déploiement sur Render (Blueprint)

Le fichier `render.yaml` à la racine décrit les deux services à déployer.

1. **Push** sur GitHub
2. Sur Render → **New → Blueprint Instance**
3. Sélectionner le repo → **Apply**
4. Render déploie automatiquement le back et le front, et injecte l'URL du back dans le front via `VITE_BACKEND_URL`

---

## Bonnes pratiques

- Utiliser `pnpm` partout (pas de npm/yarn)
- Ajouter les dépendances avec `--filter front` ou `--filter back`
- Logique métier isolée dans `/Test`, sans dépendance à l'UI

## Documentation

- Voir `/Front/explication.md` pour un guide Socket.IO détaillé
- Voir `/Back/server.js` pour la logique temps réel
- Voir `JOURNAL_ITERATION.md` pour le journal de développement TDD du Memory

---

**Développé pour l'apprentissage et la collaboration.**