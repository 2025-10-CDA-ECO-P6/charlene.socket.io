// Logique partagée Puissance 4 (aussi dans Test/src/puissance4.ts)

export type Cell = 1 | 2 | null

export function findWinningCells(board: Cell[][]): Set<string> {
  const check = (cells: [number, number][]) => {
    const [first, ...rest] = cells
    const val = board[first[0]][first[1]]
    return val && rest.every(([r, c]) => board[r][c] === val)
  }
  const toKey = (cells: [number, number][]) => new Set(cells.map(([r, c]) => `${r}-${c}`))

  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 4; col++) {
      const cells: [number, number][] = [[row, col], [row, col+1], [row, col+2], [row, col+3]]
      if (check(cells)) return toKey(cells)
    }
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 7; col++) {
      const cells: [number, number][] = [[row, col], [row+1, col], [row+2, col], [row+3, col]]
      if (check(cells)) return toKey(cells)
    }
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++) {
      const cells: [number, number][] = [[row, col], [row+1, col+1], [row+2, col+2], [row+3, col+3]]
      if (check(cells)) return toKey(cells)
    }
  for (let row = 3; row < 6; row++)
    for (let col = 0; col < 4; col++) {
      const cells: [number, number][] = [[row, col], [row-1, col+1], [row-2, col+2], [row-3, col+3]]
      if (check(cells)) return toKey(cells)
    }

  return new Set()
}