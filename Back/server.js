import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173", "https://socket-io-front.vercel.app"],
    })
);
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://socket-io-front.vercel.app"],
        methods: ["GET", "POST"],
    },
});

// Compteur d'utilisateurs connectés
let connectedUsers = 0;

// Fonction pour formater la date
const formatMessage = (message) => {
    const now = new Date();
    const time = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const date = now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    return {
        text: message,
        time: time,
        date: date,
        timestamp: now,
    };
};

io.on("connection", (socket) => {
    console.log("Un utilisateur connecté:", socket.id);

    // Incrémenter le compteur et émettre à la connexion
    connectedUsers++;
    io.emit("users count", connectedUsers);

    // Gestion des rooms
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} a rejoint la room ${roomId}`);
        // Notifier tous les utilisateurs de la room (y compris l'émetteur)
        io.to(roomId).emit(
            "room_message",
            formatMessage(`Un nouvel utilisateur a rejoint la room ${roomId}`)
        );
    });

    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`${socket.id} a quitté la room ${roomId}`);
        // Notifier tous les utilisateurs de la room (y compris l'émetteur)
        io.to(roomId).emit(
            "room_message",
            formatMessage(`Un utilisateur a quitté la room ${roomId}`)
        );
    });

    // Gestion des messages dans une room spécifique
    socket.on("room_message", ({ room, message }) => {
        console.log(`Message dans la room ${room}:`, message);
        // Envoyer le message à tous les utilisateurs de la room
        io.to(room).emit("room_message", formatMessage(message));
    });

    // Chat global (sans room)
    socket.on("chat message", (msg) => {
        console.log("Message global:", msg);
        // Broadcast à tous les utilisateurs connectés
        io.emit("chat message", formatMessage(msg));
    });

    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté:", socket.id);
        // Décrémenter le compteur et émettre à la déconnexion
        connectedUsers--;
        io.emit("users count", connectedUsers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
