# Socket Chat, Memory & Puissance 4 — Monorepo

Ce projet est un monorepo regroupant plusieurs applications :

- **Un chat en temps réel** avec rooms (Socket.IO) (Pas fait par moi-même dans ce repository)
- **Un mini-jeu Memory** développé en TDD dans le cadre du diplôme CDA
- **Un Puissance 4 multijoueur** en temps réel, développé en TDD

## Démonstration
https://www.loom.com/share/fc10ea643de84d38bcb99f996521b2fe
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

### 5. Lancer les tests (Memory + Puissance 4)

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
| `pnpm test` | Exécute les tests unitaires (Memory + Puissance 4) |
| `pnpm --filter test-game test:watch` | Tests en mode watch |
| `pnpm --filter test-game test:coverage` | Rapport de couverture |
| `pnpm add <pkg> --filter front` | Ajoute un package au frontend |
| `pnpm add <pkg> --filter back` | Ajoute un package au backend |

---

## Backend — Socket Chat

Le serveur écoute sur `process.env.PORT` (ou 3000 en local) et expose les événements Socket.IO suivants :

### Chat

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

### Puissance 4

| Événement (reçu) | Description |
|------------------|-------------|
| `create_game` | Créer une nouvelle partie |
| `join_game` | Rejoindre une partie existante (code room) |
| `drop_piece` | Jouer un jeton dans une colonne |

| Événement (émis) | Description |
|------------------|-------------|
| `game_created` | Confirmation de création + roomId |
| `game_start` | La partie démarre (board initial, joueur courant) |
| `game_update` | État du plateau mis à jour après un coup |
| `game_over` | Fin de partie (winner, reason, board final) |
| `join_error` | Erreur lors de la tentative de rejoindre |

---

## Frontend — Routes

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/chat` | Chat global en temps réel |
| `/memory` | Jeu Memory |
| `/:roomId` | Chat dans une room spécifique |
| `/puissance4` | Lobby Puissance 4 (créer / rejoindre une partie) |
| `/puissance4/:roomId` | Plateau de jeu Puissance 4 en temps réel |

---

## Jeu Memory — TDD (CDA)

> Projet réalisé dans le cadre du diplôme **Concepteur Développeur d'Applications**.
> Objectif : appliquer la méthodologie **Test Driven Development** sur la logique métier d'un mini-jeu.

### Règles du jeu

- Le plateau contient des cartes réparties en **paires**, toutes **face cachée**
- Le joueur retourne **deux cartes** à chaque tour
- Si elles affichent le **même symbole** → elles sont définitivement **trouvées** et restent visibles
- Si elles sont **différentes** → elles reviennent **face cachée**
- Une carte déjà trouvée **ne peut plus être retournée**
- Il est **impossible de matcher une carte avec elle-même**
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

> Voir `JOURNAL_ITERATION_MEMORY.md` pour le détail de chaque itération.

### Organisation des tests (`/Test/src/memory.test.ts`)

Les 13 tests sont classés en 4 catégories :

| Catégorie | Nb | Description |
|-----------|----|-------------|
| **Parcours nominal** | 5 | Le jeu se déroule normalement, sans erreur |
| **Cas d'erreur** | 3 | Le joueur fait une action incorrecte (mauvaise paire, carte déjà matchée) |
| **Cas aux frontières** | 1 | Valeur à la limite du domaine valide (1 seul symbole) |
| **Cas limites** | 4 | Entrées extrêmes ou invalides (plateau vide, id inexistant, même carte deux fois) |

### Couverture de code (Coverage)

La couverture est mesurée avec **Vitest + v8** et couvre uniquement les fichiers de `src/`.

```bash
pnpm --filter test-game test:coverage
```

Un rapport est généré dans le terminal et en HTML dans `Test/coverage/index.html`.

**Seuils KPI configurés (minimum requis) :**

| Métrique | Seuil | Résultat actuel |
|----------|-------|-----------------|
| Statements | 80% | 100% |
| Branches | 80% | 100% |
| Functions | 80% | 100% |
| Lines | 80% | 100% |

---

## Jeu Puissance 4 — TDD + Socket.IO (CDA)

> Jeu multijoueur en temps réel développé en TDD dans le cadre du diplôme **Concepteur Développeur d'Applications**.

### Règles du jeu

- Grille de **6 lignes × 7 colonnes**
- **2 joueurs** : Joueur 1 (🔴) et Joueur 2 (🟡), le Joueur 1 commence
- Le jeton **tombe en bas** de la colonne choisie (gravité)
- On ne peut pas jouer dans une **colonne pleine**
- Victoire si un joueur aligne **4 jetons** horizontalement, verticalement ou en diagonale
- Grille pleine sans alignement → **match nul**

### Logique métier (`/Test/src/puissance4.ts`)

| Fonction | Description |
|----------|-------------|
| `createGame()` | Crée une nouvelle partie (grille vide, joueur 1) |
| `dropPiece(game, col)` | Joue un jeton dans la colonne (gravité + alternance) |
| `checkWinner(board)` | Détecte un vainqueur (1, 2 ou null) |
| `isDraw(board)` | Vérifie si la grille est pleine sans vainqueur |
| `findWinningCells(board)` | Retourne les 4 positions gagnantes pour la mise en surbrillance |

### Organisation des tests (`/Test/src/puissance4.test.ts`)

Les 22 tests sont classés en 4 catégories :

| Catégorie | Nb | Description |
|-----------|----|-------------|
| **Parcours nominal** | 10 | Création, gravité, alternance, toutes les victoires, match nul |
| **Cas d'erreur** | 3 | Victoire J2, pas de vainqueur en cours de partie, colonne pleine |
| **Cas limites** | 4 | Colonne hors-bornes, colonne négative, `isDraw` sur grille vide ou non pleine |
| **findWinningCells** | 5 | Set vide, victoire dans les 4 directions |

> Voir `JOURNAL_ITERATION_PUISSANCE4.md` pour le détail de chaque itération.

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
- Voir `JOURNAL_ITERATION_MEMORY.md` pour le journal de développement TDD du Memory
- Voir `JOURNAL_ITERATION_PUISSANCE4.md` pour le journal de développement TDD du Puissance 4

---

**Développé pour l'apprentissage et la collaboration.**