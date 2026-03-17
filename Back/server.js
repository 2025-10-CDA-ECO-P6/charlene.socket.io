import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173", "https://charlene-socket-front.onrender.com"],
    })
);
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://charlene-socket-front.onrender.com"],
        methods: ["GET", "POST"],
    },
});

// ============================================================
// ÉTAT GLOBAL
// ============================================================

let connectedUsers = 0;
const games = new Map(); // roomId → état de la partie Puissance 4

// ============================================================
// UTILITAIRES — CHAT
// ============================================================

const formatMessage = (message) => {
    const now = new Date();
    return {
        text: message,
        time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        date: now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        timestamp: now,
    };
};

// ============================================================
// UTILITAIRES — PUISSANCE 4
// ============================================================

const checkWinner = (board) => {
    // Horizontal
    for (let row = 0; row < 6; row++)
        for (let col = 0; col < 4; col++) {
            const cell = board[row][col];
            if (cell && cell === board[row][col+1] && cell === board[row][col+2] && cell === board[row][col+3]) return cell;
        }
    // Vertical
    for (let row = 0; row < 3; row++)
        for (let col = 0; col < 7; col++) {
            const cell = board[row][col];
            if (cell && cell === board[row+1][col] && cell === board[row+2][col] && cell === board[row+3][col]) return cell;
        }
    // Diagonale descendante (↘)
    for (let row = 0; row < 3; row++)
        for (let col = 0; col < 4; col++) {
            const cell = board[row][col];
            if (cell && cell === board[row+1][col+1] && cell === board[row+2][col+2] && cell === board[row+3][col+3]) return cell;
        }
    // Diagonale montante (↗)
    for (let row = 3; row < 6; row++)
        for (let col = 0; col < 4; col++) {
            const cell = board[row][col];
            if (cell && cell === board[row-1][col+1] && cell === board[row-2][col+2] && cell === board[row-3][col+3]) return cell;
        }
    return null;
};

// ============================================================
// CONNEXION SOCKET
// ============================================================

io.on("connection", (socket) => {
    console.log("Un utilisateur connecté:", socket.id);
    connectedUsers++;
    io.emit("users count", connectedUsers);

    // --------------------------------------------------------
    // CHAT
    // --------------------------------------------------------

    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        io.to(roomId).emit("room_message", formatMessage(`Un nouvel utilisateur a rejoint la room ${roomId}`));
    });

    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit("room_message", formatMessage(`Un utilisateur a quitté la room ${roomId}`));
    });

    socket.on("room_message", ({ room, message }) => {
        io.to(room).emit("room_message", formatMessage(message));
    });

    socket.on("chat message", (msg) => {
        io.emit("chat message", formatMessage(msg));
    });

    // --------------------------------------------------------
    // PUISSANCE 4
    // --------------------------------------------------------

    socket.on("create_game", () => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        socket.join(roomId);
        games.set(roomId, {
            board: Array.from({ length: 6 }, () => Array(7).fill(null)),
            currentPlayer: 1,
            players: [socket.id],
        });
        socket.emit("game_created", { roomId });
        console.log(`Partie Puissance 4 créée : ${roomId}`);
    });

    socket.on("join_game", (roomId) => {
        const game = games.get(roomId);
        if (!game) { socket.emit("join_error", "Partie introuvable."); return; }
        if (game.players.length >= 2) { socket.emit("join_error", "Partie déjà complète."); return; }

        socket.join(roomId);
        game.players.push(socket.id);
        io.to(roomId).emit("game_start", { board: game.board, currentPlayer: game.currentPlayer });
        console.log(`Partie ${roomId} démarrée`);
    });

    socket.on("drop_piece", ({ roomId, col }) => {
        const game = games.get(roomId);
        if (!game) return;

        const playerIndex = game.players.indexOf(socket.id);
        if (playerIndex + 1 !== game.currentPlayer) return; // pas le bon tour

        // Gravité : placer le jeton en bas de la colonne
        let placed = false;
        for (let row = 5; row >= 0; row--) {
            if (game.board[row][col] === null) {
                game.board[row][col] = game.currentPlayer;
                placed = true;
                break;
            }
        }
        if (!placed) return; // colonne pleine

        const winner = checkWinner(game.board);
        const isDraw = game.board.every(row => row.every(cell => cell !== null));

        if (winner) {
            io.to(roomId).emit("game_over", { winner, reason: "win" });
            games.delete(roomId);
            return;
        }
        if (isDraw) {
            io.to(roomId).emit("game_over", { winner: null, reason: "draw" });
            games.delete(roomId);
            return;
        }

        game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
        io.to(roomId).emit("game_update", { board: game.board, currentPlayer: game.currentPlayer });
    });

    // --------------------------------------------------------
    // DÉCONNEXION
    // --------------------------------------------------------

    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté:", socket.id);
        connectedUsers--;
        io.emit("users count", connectedUsers);

        // Notifier l'adversaire si une partie Puissance 4 était en cours
        for (const [roomId, game] of games.entries()) {
            if (game.players.includes(socket.id)) {
                io.to(roomId).emit("game_over", { winner: null, reason: "disconnect" });
                games.delete(roomId);
            }
        }
    });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});