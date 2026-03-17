# Journal d'itération — Puissance 4 en TDD

> Projet : Jeu Puissance 4 multijoueur
> Méthodologie : Test Driven Development (Red → Green → Refactor)

---

## Règles métier identifiées

Avant de commencer le développement, les règles métier ont été listées et priorisées :

| #   | Règle métier |
| --- | --- |
| 1   | La grille fait 6 lignes × 7 colonnes, toutes les cellules sont vides au départ |
| 2   | Il y a 2 joueurs : Joueur 1 (🔴) et Joueur 2 (🟡), le Joueur 1 commence |
| 3   | Un joueur choisit une colonne, le jeton tombe en bas de la colonne (gravité) |
| 4   | On ne peut pas jouer dans une colonne pleine |
| 5   | Les joueurs alternent à chaque coup |
| 6   | Un joueur gagne s'il aligne 4 jetons horizontalement |
| 7   | Un joueur gagne s'il aligne 4 jetons verticalement |
| 8   | Un joueur gagne s'il aligne 4 jetons en diagonale |
| 9   | Si la grille est pleine sans alignement → match nul |

---

## Itérations

### Itération 1 — Créer la grille

**Règle visée :** La grille fait 6 lignes × 7 colonnes, remplie de `null`

**Test écrit :**
```ts
it('Doit créer une grille de 6 lignes et 7 colonnes remplie de null', () => {
  const game = createGame()
  expect(game.board).toHaveLength(6)
  expect(game.board[0]).toHaveLength(7)
  expect(game.board[0][0]).toBeNull()
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `createGame()` retourne `{ board: Array(6×7 null), currentPlayer: 1 }`

---

### Itération 2 — Joueur 1 commence

**Règle visée :** Le Joueur 1 commence toujours

**Test écrit :**
```ts
it('Doit démarrer avec le joueur 1', () => {
  const game = createGame()
  expect(game.currentPlayer).toBe(1)
})
```

**Résultat :** 🟢 Vert directement (couvert par l'implémentation de l'itération 1)

---

### Itération 3 — Gravité (jeton tombe en bas)

**Règle visée :** Le jeton tombe en bas de la colonne

**Test écrit :**
```ts
it('Doit placer le jeton en bas de la colonne', () => {
  const game = createGame()
  const newGame = dropPiece(game, 0)
  expect(newGame.board[5][0]).toBe(1)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `dropPiece()` parcourt les lignes de bas en haut et place le jeton dans la première case vide

---

### Itération 4 — Alternance des joueurs

**Règle visée :** Les joueurs alternent à chaque coup

**Test écrit :**
```ts
it('Doit alterner le joueur après chaque coup', () => {
  const game = createGame()
  const newGame = dropPiece(game, 0)
  expect(newGame.currentPlayer).toBe(2)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `dropPiece()` bascule `currentPlayer` à chaque appel

---

### Itération 5 — Empilement dans la même colonne

**Règle visée :** Les jetons s'empilent (gravité cumulée)

**Test écrit :**
```ts
it('Doit empiler les jetons dans la même colonne', () => {
  let game = createGame()
  game = dropPiece(game, 0) // J1 → ligne 5
  game = dropPiece(game, 0) // J2 → ligne 4
  expect(game.board[5][0]).toBe(1)
  expect(game.board[4][0]).toBe(2)
})
```

**Résultat :** 🟢 Vert directement

---

### Itération 6 — Colonne pleine

**Règle visée :** On ne peut pas jouer dans une colonne pleine

**Test écrit :**
```ts
it('Ne doit pas placer de jeton dans une colonne pleine', () => {
  let game = createGame()
  for (let i = 0; i < 6; i++) game = dropPiece(game, 0)
  const before = game.board.map(row => [...row])
  game = dropPiece(game, 0)
  expect(game.board).toEqual(before)
})
```

**Résultat :** 🟢 Vert directement (la boucle `for` s'arrête sans modifier si la colonne est pleine)

---

### Itération 7 — Victoire horizontale

**Règle visée :** 4 jetons alignés horizontalement = victoire

**Test écrit :**
```ts
it('Doit détecter une victoire horizontale', () => {
  // J1 joue cols 0,1,2,3 avec J2 sur la même colonne
  expect(checkWinner(game.board)).toBe(1)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `checkWinner()` parcourt toutes les lignes en cherchant 4 cellules identiques consécutives

---

### Itération 8 — Victoire verticale

**Règle visée :** 4 jetons alignés verticalement = victoire

**Test écrit :**
```ts
it('Doit détecter une victoire verticale', () => {
  // J1 joue 4 fois en colonne 0
  expect(checkWinner(game.board)).toBe(1)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `checkWinner()` étendu avec vérification verticale

---

### Itération 9 — Victoire en diagonale descendante (↘)

**Règle visée :** 4 jetons alignés en diagonale descendante = victoire

**Test écrit :**
```ts
it('Doit détecter une victoire en diagonale descendante', () => {
  // J1 : (2,0) (3,1) (4,2) (5,3)
  expect(checkWinner(game.board)).toBe(1)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert (après correction du scénario pour éviter une victoire horizontale parasite)
**Implémentation :** `checkWinner()` étendu avec vérification diagonale ↘

---

### Itération 10 — Victoire en diagonale montante (↗)

**Règle visée :** 4 jetons alignés en diagonale montante = victoire

**Test écrit :**
```ts
it('Doit détecter une victoire en diagonale montante', () => {
  // J1 : (5,0) (4,1) (3,2) (2,3)
  expect(checkWinner(game.board)).toBe(1)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `checkWinner()` étendu avec vérification diagonale ↗

---

### Itération 11 — Match nul

**Règle visée :** Grille pleine sans vainqueur = match nul

**Test écrit :**
```ts
it('Doit détecter un match nul quand la grille est pleine sans vainqueur', () => {
  // Remplissage complet via séquence de coups sans aligner 4
  expect(isDraw(game.board)).toBe(true)
})
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `isDraw()` vérifie que toutes les cellules sont non-null

---

### Itération 12 — Mise en évidence des jetons gagnants

**Règle visée :** Après une victoire, identifier les 4 cellules gagnantes pour les mettre en surbrillance

**Contexte :** Évolution fonctionnelle demandée après les tests de base — amélioration de l'expérience utilisateur

**Test écrit :**
```ts
it('Doit retourner les 4 positions d\'une victoire horizontale', () => {
  // J1 gagne en ligne 5, colonnes 0-3
  expect(findWinningCells(game.board)).toEqual(new Set(['5-0', '5-1', '5-2', '5-3']))
})
// + tests vertical, diagonal ↘, diagonal ↗, et Set vide si pas de vainqueur
```

**Résultat :** 🔴 Rouge → 🟢 Vert
**Implémentation :** `findWinningCells()` retourne un `Set<string>` de clés `"row-col"` pour les 4 jetons gagnants

**Refactor :** Fonction extraite dans `Front/app/lib/puissance4.ts` (fichier partagé) pour éviter la duplication entre le front et les tests

---

## Bilan

| Métrique | Valeur |
| --- | --- |
| Règles métier | 9 |
| Fonctions testées | 5 (`createGame`, `dropPiece`, `checkWinner`, `isDraw`, `findWinningCells`) |
| Tests écrits | 22 |
| Couverture | 100% |
| Bugs trouvés en TDD | 1 (scénario diagonal ↘ avec victoire horizontale parasite) |

### Catégories de tests

- **Parcours nominal** (10 tests) : création, gravité, alternance, empilement, victoires, match nul
- **Cas d'erreur** (3 tests) : victoire J2, pas de vainqueur en cours de partie, colonne pleine
- **Cas limites** (4 tests) : colonne hors-bornes, colonne négative, `isDraw` sur grille vide, `isDraw` sur grille non pleine
- **findWinningCells** (5 tests) : Set vide, victoire horizontale, verticale, diagonale ↘, diagonale ↗