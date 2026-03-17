//les tests
import { describe, it, expect } from 'vitest'
import { createBoard, flipCard, checkMatch, isGameWon } from './memory'

describe('Memory - createBoard', () => {
  it('Doit créer un tableau avec des paires de cartes', () => {
    const board = createBoard(['🐶', '🐱', '🐭'])
    expect(board).toHaveLength(6)
  })
})

it('Doit créer des cartes avec un id, un symbole et isFlipped false par défaut', () => {
  const board = createBoard(['🐶', '🐱'])
  
  expect(board[0]).toEqual({ id: 0, symbol: '🐶', isFlipped: false, isMatched: false })
  expect(board[1]).toEqual({ id: 1, symbol: '🐱', isFlipped: false, isMatched: false })
})

it('Doit retourner une carte lorsqu\'elle est cliquée', () => {
  const board = createBoard(['🐶', '🐱'])
  const newBoard = flipCard(board, 0)

  expect(newBoard[0].isFlipped).toBe(true)
  expect(newBoard[1].isFlipped).toBe(false) // les autres restent cachées
})

it('Doit faire correspondre deux cartes avec le même symbole', () => {
  const board = createBoard(['🐶', '🐱'])
  const newBoard = checkMatch(board, 0, 2) // id 0 et id 2 sont tous les deux 🐶

  expect(newBoard[0].isMatched).toBe(true)
  expect(newBoard[2].isMatched).toBe(true)
  expect(newBoard[1].isMatched).toBe(false)
})

it('Doit retourner les deux cartes si elles ne correspondent pas', () => {
  let board = createBoard(['🐶', '🐱'])
  board = flipCard(board, 0)
  board = flipCard(board, 1)
  const newBoard = checkMatch(board, 0, 1) // 🐶 et 🐱 sont différents

  expect(newBoard[0].isFlipped).toBe(false)
  expect(newBoard[1].isFlipped).toBe(false)
})

it('Ne doit pas retourner une carte qui est déjà matchée', () => {
  let board = createBoard(['🐶', '🐱'])
  board = flipCard(board, 0)
  board = flipCard(board, 2)
  board = checkMatch(board, 0, 2) // 🐶 matché
  const newBoard = flipCard(board, 0) // on essaie de retourner une carte matchée

  expect(newBoard[0].isMatched).toBe(true)//toujours matchée
  expect(newBoard[0].isFlipped).toBe(true) // reste face visible
})

it('Doit retourner true quand toutes les cartes sont matchées', () => {
  let board = createBoard(['🐶', '🐱'])
  board = checkMatch(board, 0, 2) // match 🐶
  board = checkMatch(board, 1, 3) // match 🐱

  expect(isGameWon(board)).toBe(true)
})

it('Doit retourner false quand toutes les cartes ne sont pas matchées', () => {
  let board = createBoard(['🐶', '🐱'])
  board = checkMatch(board, 0, 2) // seulement 🐶 matché

  expect(isGameWon(board)).toBe(false)
})