# Journal d'itération — Jeu Memory en TDD

> Projet : Mini-jeu Memory
> Diplôme : Concepteur Développeur d'Applications (CDA)
> Méthodologie : Test Driven Development (Red → Green → Refactor)

---

## Règles métier identifiées

Avant de commencer le développement, les règles métier ont été listées et priorisées :

| #   | Règle métier |
| --- | --- |
| 1   | Le plateau est composé de paires de cartes (chaque symbole apparaît exactement deux fois) |
| 2   | Chaque carte possède un identifiant unique, un symbole, et est face cachée par défaut |
| 3   | Retourner une carte la rend visible |
| 4   | Deux cartes retournées avec le même symbole sont définitivement trouvées |
| 5   | Deux cartes retournées avec des symboles différents reviennent face cachée |
| 6   | Une carte déjà trouvée ne peut plus être retournée |
| 7   | La partie est gagnée quand toutes les paires ont été trouvées |

---

## Itération 1 — Création du plateau

### Règle métier

Le plateau doit contenir exactement deux fois chaque symbole fourni.

### Test écrit (Red)

```typescript
it('should create a board with pairs of cards', () => {
  const board = createBoard(['🐶', '🐱', '🐭'])
  expect(board).toHaveLength(6)
})
```

### Implémentation (Green)

```typescript
export function createBoard(symbols: string[]) {
  return [...symbols, ...symbols]
}
```

### Résultat

✅ Test passant — code minimal et suffisant, pas de refactorisation nécessaire.

---

## Itération 2 — Structure d'une carte

### Règle métier

Chaque carte doit avoir une structure précise : `id`, `symbol`, `isFlipped` (false par défaut), `isMatched` (false par défaut).

### Test écrit (Red)

```typescript
it('should create cards with id, symbol and isFlipped false by default', () => {
  const board = createBoard(['🐶', '🐱'])
  expect(board[0]).toEqual({ id: 0, symbol: '🐶', isFlipped: false, isMatched: false })
  expect(board[1]).toEqual({ id: 1, symbol: '🐱', isFlipped: false, isMatched: false })
})
```

### Implémentation (Green)

Introduction de l'interface `Card` et refactorisation de `createBoard` :

```typescript
export interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export function createBoard(symbols: string[]): Card[] {
  return [...symbols, ...symbols].map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false
  }))
}
```

### Résultat

✅ Tests passants — introduction du typage TypeScript via l'interface `Card`.

---

## Itération 3 — Retourner une carte

### Règle métier

Retourner une carte doit passer son état `isFlipped` à `true` sans affecter les autres cartes.

### Test écrit (Red)

```typescript
it('should flip a card', () => {
  const board = createBoard(['🐶', '🐱'])
  const newBoard = flipCard(board, 0)
  expect(newBoard[0].isFlipped).toBe(true)
  expect(newBoard[1].isFlipped).toBe(false)
})
```

### Implémentation (Green)

```typescript
export function flipCard(board: Card[], id: number): Card[] {
  return board.map(card =>
    card.id === id ? { ...card, isFlipped: true } : card
  )
}
```

### Résultat

✅ Tests passants — approche immutable avec `map` et spread operator.

---

## Itération 4 — Paire trouvée

### Règle métier

Deux cartes portant le même symbole doivent être marquées `isMatched: true`.

### Test écrit (Red)

```typescript
it('should match two cards with the same symbol', () => {
  const board = createBoard(['🐶', '🐱'])
  const newBoard = checkMatch(board, 0, 2) // id 0 et id 2 sont tous les deux 🐶
  expect(newBoard[0].isMatched).toBe(true)
  expect(newBoard[2].isMatched).toBe(true)
  expect(newBoard[1].isMatched).toBe(false)
})
```

### Implémentation (Green)

```typescript
export function checkMatch(board: Card[], id1: number, id2: number): Card[] {
  const card1 = board.find(c => c.id === id1)
  const card2 = board.find(c => c.id === id2)

  if (card1?.symbol === card2?.symbol) {
    return board.map(card =>
      card.id === id1 || card.id === id2
        ? { ...card, isMatched: true }
        : card
    )
  }

  return board
}
```

### Résultat

✅ Tests passants.

---

## Itération 5 — Paire non trouvée

### Règle métier

Deux cartes avec des symboles différents doivent revenir face cachée (`isFlipped: false`).

### Test écrit (Red)

```typescript
it('should unflip two cards if they do not match', () => {
  let board = createBoard(['🐶', '🐱'])
  board = flipCard(board, 0)
  board = flipCard(board, 1)
  const newBoard = checkMatch(board, 0, 1)
  expect(newBoard[0].isFlipped).toBe(false)
  expect(newBoard[1].isFlipped).toBe(false)
})
```

> **Note TDD** : un premier test sans le `flipCard` préalable donnait un faux positif (les cartes étaient déjà à `false` par défaut). Le test a été corrigé pour refléter un scénario réaliste.

### Implémentation (Green)

Extension de `checkMatch` avec le cas de non-correspondance :

```typescript
return board.map(card =>
  card.id === id1 || card.id === id2
    ? { ...card, isFlipped: false }
    : card
)
```

### Résultat

✅ Tests passants — cas de faux positif identifié et corrigé grâce à la rigueur TDD.

---

## Itération 6 — Protection des cartes trouvées

### Règle métier

Une carte déjà matchée ne doit pas pouvoir être retournée à nouveau.

### Test écrit (Red)

```typescript
it('should not flip a card that is already matched', () => {
  let board = createBoard(['🐶', '🐱'])
  board = flipCard(board, 0)
  board = flipCard(board, 2)
  board = checkMatch(board, 0, 2)
  const newBoard = flipCard(board, 0)
  expect(newBoard[0].isMatched).toBe(true)
  expect(newBoard[0].isFlipped).toBe(true) // reste visible, non modifiable
})
```

### Implémentation (Green)

Ajout de la condition `!card.isMatched` dans `flipCard` :

```typescript
export function flipCard(board: Card[], id: number): Card[] {
  return board.map(card =>
    card.id === id && !card.isMatched ? { ...card, isFlipped: true } : card
  )
}
```

### Résultat

✅ Tests passants.

---

## Itération 7 — Condition de victoire

### Règle métier

La partie est gagnée quand toutes les cartes du plateau ont `isMatched: true`.

### Tests écrits (Red)

```typescript
it('should return true when all cards are matched', () => {
  let board = createBoard(['🐶', '🐱'])
  board = checkMatch(board, 0, 2)
  board = checkMatch(board, 1, 3)
  expect(isGameWon(board)).toBe(true)
})

it('should return false when not all cards are matched', () => {
  let board = createBoard(['🐶', '🐱'])
  board = checkMatch(board, 0, 2)
  expect(isGameWon(board)).toBe(false)
})
```

### Implémentation (Green)

```typescript
export function isGameWon(board: Card[]): boolean {
  return board.every(card => card.isMatched)
}
```

### Résultat

✅ Tests passants — utilisation de `Array.every` pour une vérification concise.

---

## Bilan

### Statistiques

| Métrique | Valeur |
| --- | --- |
| Règles métier testées | 7   |
| Tests unitaires écrits | 8   |
| Fonctions implémentées | 4   |
| Faux positifs détectés et corrigés | 1   |

### Observations sur la démarche TDD

- L'écriture des tests **avant** l'implémentation a forcé une réflexion préalable sur le comportement attendu
- Un faux positif a été détecté à l'itération 5 : le test passait sans tester réellement le comportement. La démarche TDD a permis de l'identifier et de le corriger
- Les fonctions sont toutes **pures** (sans effets de bord) grâce à la pression des tests : il est plus simple de tester une fonction qui retourne une nouvelle valeur qu'une fonction qui modifie l'état en place
- Le code est resté **minimal** à chaque étape, évitant la sur-ingénierie

### Points d'amélioration possibles
- Tester le mélange aléatoire des cartes
- Intégrer la logique dans l'interface React via Socket.IO