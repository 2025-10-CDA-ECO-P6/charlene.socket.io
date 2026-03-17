import { useState, useEffect, useRef } from "react"
import { createBoard, flipCard, checkMatch, isGameWon, type Card } from "../lib/memory"

const SYMBOLS = ["🐶", "🐱", "🐭", "🐹", "🦊", "🐻", "🐼", "🐨"]
const LEADERBOARD_KEY = "memory-leaderboard"

interface Score {
  pseudo: string
  moves: number
  time: number
  date: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function getLeaderboard(): Score[] {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]")
  } catch {
    return []
  }
}

function saveScore(newScore: Score): Score[] {
  const scores = getLeaderboard()
  const updated = [...scores, newScore]
    .sort((a, b) => a.moves - b.moves || a.time - b.time)
    .slice(0, 3)
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated))
  return updated
}

export default function MemoryBoard() {
  const [pseudo, setPseudo] = useState("")
  const [board, setBoard] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [locked, setLocked] = useState(false)
  const [time, setTime] = useState(0)
  const [leaderboard, setLeaderboard] = useState<Score[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setLeaderboard(getLeaderboard())
    startGame()
    return () => stopTimer()
  }, [])

  function startTimer() {
    stopTimer()
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function startGame() {
    setBoard(createBoard(SYMBOLS))
    setFlipped([])
    setMoves(0)
    setWon(false)
    setLocked(false)
    stopTimer()
    setTime(0)
  }

  function handleCardClick(id: number) {
    if (locked) return
    if (flipped.includes(id)) return

    if (flipped.length === 0 && moves === 0 && time === 0) {
      startTimer()
    }

    const newBoard = flipCard(board, id)
    const newFlipped = [...flipped, id]
    setBoard(newBoard)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)

      setTimeout(() => {
        const checked = checkMatch(newBoard, newFlipped[0], newFlipped[1])
        setBoard(checked)
        setFlipped([])
        setLocked(false)
        if (isGameWon(checked)) {
          stopTimer()
          setWon(true)
          const updated = saveScore({
            pseudo: pseudo.trim() || "Anonyme",
            moves: moves + 1,
            time,
            date: new Date().toLocaleDateString("fr-FR"),
          })
          setLeaderboard(updated)
        }
      }, 800)
    } else {
      setFlipped(newFlipped)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="10" width="20" height="28" rx="3" fill="#6366f1" />
          <rect x="4" y="12" width="16" height="24" rx="2" fill="#818cf8" />
          <text x="12" y="28" textAnchor="middle" fontSize="14" fill="white">?</text>
          <rect x="26" y="10" width="20" height="28" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="36" y="29" textAnchor="middle" fontSize="18">&#11088;</text>
        </svg>
        <h1 className="text-3xl font-bold text-gray-800">Memory Game</h1>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="10" width="20" height="28" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="12" y="29" textAnchor="middle" fontSize="18">&#11088;</text>
          <rect x="26" y="10" width="20" height="28" rx="3" fill="#6366f1" />
          <rect x="28" y="12" width="16" height="24" rx="2" fill="#818cf8" />
          <text x="36" y="28" textAnchor="middle" fontSize="14" fill="white">?</text>
        </svg>
      </div>

      {/* Barre de contrôles */}
      <div className="flex items-center gap-4 flex-wrap justify-center text-gray-600">
        <input
          type="text"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
          placeholder="Entrez votre pseudo"
          maxLength={20}
          className="w-[356px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
        />
        <span>Coups : <strong>{moves}</strong></span>
        <span>⏱️ <strong>{formatTime(time)}</strong></span>
        <button
          onClick={startGame}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded text-sm"
        >
          Nouvelle partie
        </button>
      </div>

      {/* Message de victoire */}
      {won && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg text-center">
          🎉 Bravo <strong>{pseudo || "Anonyme"}</strong> ! Partie terminée en{" "}
          <strong>{moves}</strong> coups et <strong>{formatTime(time)}</strong> !
        </div>
      )}

      <div className="flex gap-10 items-start">
        {/* Plateau */}
        <div className="grid grid-cols-4 gap-3">
          {board.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || locked}
              className={`
                w-20 h-20 text-3xl rounded-xl border-2 transition-all duration-300 font-bold
                ${card.isMatched
                  ? "bg-green-100 border-green-400 cursor-default"
                  : card.isFlipped
                    ? "bg-white border-cyan-400 shadow-md"
                    : "bg-cyan-500 border-cyan-600 hover:bg-cyan-400 cursor-pointer"
                }
              `}
            >
              {card.isFlipped || card.isMatched ? card.symbol : ""}
            </button>
          ))}
        </div>

        {/* Palmarès */}
        {leaderboard.length > 0 && (
          <div className="w-52">
            <h2 className="text-sm font-semibold text-gray-600 mb-2 text-center">🏆 Palmarès</h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
              {leaderboard.map((s, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 ${i < leaderboard.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{["🥇", "🥈", "🥉"][i]}</span>
                    <span className="font-semibold text-sm text-gray-800 truncate">{s.pseudo}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    {s.moves} coups · {formatTime(s.time)} · {s.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}