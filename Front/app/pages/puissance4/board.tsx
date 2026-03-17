import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router"
import { socket } from "../../lib/socket"
import { findWinningCells } from "../../lib/puissance4"

type Cell = 1 | 2 | null

const EMPTY_BOARD: Cell[][] = Array.from({ length: 6 }, () => Array(7).fill(null))
const LEADERBOARD_KEY = "puissance4-leaderboard"

interface Score {
  pseudo: string
  wins: number
  losses: number
}

function saveScore(pseudo: string, won: boolean) {
  try {
    const scores: Score[] = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]")
    const existing = scores.find(s => s.pseudo === pseudo)
    if (existing) {
      if (won) existing.wins++
      else existing.losses++
    } else {
      scores.push({ pseudo, wins: won ? 1 : 0, losses: won ? 0 : 1 })
    }
    const sorted = scores.sort((a, b) => b.wins - a.wins).slice(0, 3)
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted))
  } catch {}
}

function getLeaderboard(): Score[] {
  try { return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]") }
  catch { return [] }
}

export default function Puissance4Board() {
  const { roomId } = useParams<{ roomId: string }>()
  const { state } = useLocation()
  const navigate = useNavigate()

  const myPlayer: 1 | 2 = state?.myPlayer ?? 1
  const pseudo: string = state?.pseudo || ""

  const [board, setBoard] = useState<Cell[][]>(state?.initialBoard ?? EMPTY_BOARD)
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(state?.initialCurrentPlayer ?? 1)
  const [waiting, setWaiting] = useState(myPlayer === 1 && !state?.initialBoard)
  const [gameOver, setGameOver] = useState<{ winner: 1 | 2 | null, reason: string } | null>(null)
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set())
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<Score[]>(() => getLeaderboard())

  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.on("game_start", ({ board, currentPlayer }: { board: Cell[][], currentPlayer: 1 | 2 }) => {
      setBoard(board)
      setCurrentPlayer(currentPlayer)
      setWaiting(false)
    })

    socket.on("game_update", ({ board, currentPlayer }: { board: Cell[][], currentPlayer: 1 | 2 }) => {
      setBoard(board)
      setCurrentPlayer(currentPlayer)
    })

    socket.on("game_over", ({ winner, reason, board }: { winner: 1 | 2 | null, reason: string, board?: Cell[][] }) => {
      if (board) {
        setBoard(board)
        if (winner) setWinningCells(findWinningCells(board))
      }
      if (reason !== "disconnect" && pseudo) {
        const won = winner === myPlayer
        saveScore(pseudo, won)
        setLeaderboard(getLeaderboard())
      }
      setGameOver({ winner, reason })
    })

    return () => {
      socket.off("game_start")
      socket.off("game_update")
      socket.off("game_over")
    }
  }, [myPlayer, pseudo])

  function handleColClick(col: number) {
    if (waiting || gameOver || currentPlayer !== myPlayer) return
    socket.emit("drop_piece", { roomId, col })
  }

  const isMyTurn = !waiting && !gameOver && currentPlayer === myPlayer
  const myToken = myPlayer === 1 ? "🔴" : "🟡"

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <h1 className="text-3xl font-bold text-gray-800">🔴🟡 Puissance 4</h1>

      <div className="text-sm text-gray-500">
        Code : <span className="font-mono font-bold text-gray-800 tracking-widest">{roomId}</span>
        {pseudo
          ? <>{" · "}<span className="font-semibold">{pseudo}</span>, Tu joues les {myToken}</>
          : <>{" · "}Tu joues les {myToken}</>
        }
      </div>

      {waiting && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-lg text-sm">
          ⏳ En attente d'un adversaire... Partage le code <strong>{roomId}</strong>
        </div>
      )}

      {!waiting && !gameOver && (
        <div className={`px-6 py-2 rounded-lg text-sm font-medium ${isMyTurn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {isMyTurn
            ? `C'est ton tour ! Tu joues les ${myToken}`
            : `Tour de l'adversaire ${currentPlayer === 1 ? "🔴" : "🟡"}`}
        </div>
      )}

      {gameOver && (
        <div className={`px-6 py-4 rounded-xl text-center ${gameOver.winner ? "bg-green-100 border border-green-300 text-green-800" : "bg-gray-100 border border-gray-300 text-gray-700"}`}>
          {gameOver.reason === "disconnect" && "❌ L'adversaire s'est déconnecté."}
          {gameOver.reason === "draw" && "🤝 Match nul !"}
          {gameOver.reason === "win" && gameOver.winner === myPlayer && "🎉 Tu as gagné !"}
          {gameOver.reason === "win" && gameOver.winner !== myPlayer && "😔 Tu as perdu."}
          <div className="mt-3">
            <button
              onClick={() => navigate("/puissance4")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Jouer une autre partie
            </button>
          </div>
        </div>
      )}

      {!waiting && (
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Plateau */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <div className="grid grid-cols-7 gap-2 mb-1">
                {Array.from({ length: 7 }, (_, col) => (
                  <button
                    key={col}
                    onClick={() => handleColClick(col)}
                    onMouseEnter={() => setHoveredCol(col)}
                    onMouseLeave={() => setHoveredCol(null)}
                    disabled={!isMyTurn}
                    className={`h-6 flex items-center justify-center text-white text-xs transition-opacity ${isMyTurn ? "opacity-100 cursor-pointer" : "opacity-0 cursor-default"}`}
                  >
                    {hoveredCol === col && isMyTurn ? "▼" : ""}
                  </button>
                ))}
              </div>

              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-2 mb-2">
                  {row.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`
                    const isWinning = winningCells.has(key)
                    return (
                      <button
                        key={colIndex}
                        onClick={() => handleColClick(colIndex)}
                        onMouseEnter={() => setHoveredCol(colIndex)}
                        onMouseLeave={() => setHoveredCol(null)}
                        disabled={!isMyTurn}
                        className={`w-10 h-10 rounded-full transition-all duration-150
                          ${isWinning ? "ring-4 ring-white scale-110 animate-pulse" : ""}
                          ${cell === 1
                            ? "bg-red-500 shadow-inner"
                            : cell === 2
                              ? "bg-yellow-400 shadow-inner"
                              : hoveredCol === colIndex && isMyTurn
                                ? myPlayer === 1 ? "bg-red-200" : "bg-yellow-200"
                                : "bg-blue-200"
                          }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 inline-block" /> Joueur 1 {myPlayer === 1 ? "(toi)" : ""}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block" /> Joueur 2 {myPlayer === 2 ? "(toi)" : ""}
              </span>
            </div>
          </div>

          {/* Palmarès */}
          {leaderboard.length > 0 && (
            <div className="w-52">
              <h2 className="text-sm font-semibold text-gray-600 mb-2 text-center">🏆 Palmarès</h2>
              <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
                {leaderboard.map((s, i) => (
                  <div key={i} className={`px-3 py-2 ${i < leaderboard.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span>{["🥇", "🥈", "🥉"][i]}</span>
                      <span className="font-semibold text-sm text-gray-800 truncate">{s.pseudo}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      {s.wins} victoire{s.wins > 1 ? "s" : ""} · {s.losses} défaite{s.losses > 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}