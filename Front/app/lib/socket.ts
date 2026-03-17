import { io } from "socket.io-client"

const rawUrl = typeof window !== "undefined"
  ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000")
  : "http://localhost:3000"

const BACKEND_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`

export const socket = io(BACKEND_URL, { autoConnect: false })