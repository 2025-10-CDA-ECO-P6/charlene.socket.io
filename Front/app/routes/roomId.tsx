// routes/roomId.tsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Route } from "./+types/room";

const socket = io("https://charlene-socket-io.onrender.com");

interface Message {
    text: string;
    time: string;
    date: string;
    timestamp: Date;
}

export async function loader({ params }: Route["LoaderArgs"]) {
    return { roomName: `Room: ${params.roomId}`, roomId: params.roomId };
}

export default function Component({ loaderData }: Route["ComponentProps"]) {
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState<Message[]>([]);

    useEffect(() => {
        // Rejoindre la room spécifique
        socket.emit("join_room", loaderData.roomId);

        // Écouter les messages de la room
        socket.on("room_message", (msg: Message) => {
            setChatLog((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("room_message");
            socket.emit("leave_room", loaderData.roomId);
        };
    }, [loaderData.roomId]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim() !== "") {
            socket.emit("room_message", {
                room: loaderData.roomId,
                message: message,
            });
            setMessage("");
        }
    };

    return (
        <>
            <section className="text-gray-600 body-font">
                <div className="container flex flex-wrap px-5 py-5 mx-auto items-center">
                    <div className="md:w-1/2 md:pr-12 md:py-8 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200">
                        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
                            {loaderData.roomName}
                        </h1>
                        <p className="leading-relaxed text-base">
                            Welcome to this private chat room. Chat securely
                            with other members.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-5 py-5">
                <div className="mb-8">
                    <ul className="space-y-2">
                        {chatLog.map((msg, index) => (
                            <li
                                key={index}
                                className="bg-gray-100 p-3 rounded-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-gray-800">{msg.text}</p>
                                    <div className="text-xs text-gray-500 ml-2">
                                        <span>{msg.time}</span>
                                        <span className="ml-1">{msg.date}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label
                            htmlFor="message"
                            className="leading-7 text-sm text-gray-600"
                        >
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                        />
                    </div>
                    <button
                        type="submit"
                        className="text-white bg-cyan-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                    >
                        Envoyer
                    </button>
                </form>
            </div>
        </>
    );
}
