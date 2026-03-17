import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { socket } from "../../lib/socket"

export default function Puissance4Lobby() {
  const [roomCode, setRoomCode] = useState("")
  const [pseudo, setPseudo] = useState(() => {
    try { return localStorage.getItem("puissance4-pseudo") || "" } catch { return "" }
  })
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const pendingRoomId = useRef<string | null>(null)

  useEffect(() => {
    socket.connect()

    socket.on("game_created", ({ roomId }: { roomId: string }) => {
      navigate(`/puissance4/${roomId}`, { state: { myPlayer: 1, pseudo } })
    })

    socket.on("game_start", ({ board, currentPlayer }: { board: (1 | 2 | null)[][], currentPlayer: 1 | 2 }) => {
      navigate(`/puissance4/${pendingRoomId.current}`, {
        state: { myPlayer: 2, pseudo, initialBoard: board, initialCurrentPlayer: currentPlayer },
      })
    })

    socket.on("join_error", (msg: string) => {
      setError(msg)
      setCreating(false)
    })

    return () => {
      socket.off("game_created")
      socket.off("game_start")
      socket.off("join_error")
    }
  }, [navigate, pseudo])

  function handlePseudoChange(value: string) {
    setPseudo(value)
    try { localStorage.setItem("puissance4-pseudo", value) } catch {}
  }

  function handleCreate() {
    setError("")
    setCreating(true)
    socket.emit("create_game")
  }

  function handleJoin(e: React.SyntheticEvent) {
    e.preventDefault()
    const code = roomCode.trim().toUpperCase()
    if (!code) return
    setError("")
    pendingRoomId.current = code
    socket.emit("join_game", code)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <h1 className="text-4xl font-bold text-gray-800">🔴🟡 Puissance 4</h1>
      <p className="text-gray-500">Jeu multijoueur en temps réel</p>

      {/* Pseudo */}
      <input
        type="text"
        value={pseudo}
        onChange={e => handlePseudoChange(e.target.value)}
        placeholder="Ton pseudo"
        maxLength={20}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 w-64"
      />

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl">

        {/* Créer une partie */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Nouvelle partie</h2>
          <p className="text-sm text-gray-500">Crée une partie et partage le code avec ton adversaire.</p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg"
          >
            {creating ? "Création..." : "Créer une partie"}
          </button>
        </div>

        {/* Rejoindre une partie */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Rejoindre</h2>
          <p className="text-sm text-gray-500">Entre le code de la partie de ton adversaire.</p>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 uppercase tracking-widest"
            />
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg"
            >
              Rejoindre
            </button>
          </form>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}