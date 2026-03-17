import { useEffect, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { io } from "socket.io-client";

const socket = io("https://charlene-socket-io.onrender.com");

interface Message {
    text: string;
    time: string;
    date: string;
    timestamp: Date;
}

interface UserData {
    timestamp: number;
    count: number;
}

const catBreeds = [
    { name: "Maine Coon", slug: "maine-coon" },
    { name: "Siamois", slug: "siamois" },
    { name: "Persan", slug: "persan" },
    { name: "Bengal", slug: "bengal" },
    { name: "Ragdoll", slug: "ragdoll" },
    { name: "British Shorthair", slug: "british-shorthair" },
    { name: "Scottish Fold", slug: "scottish-fold" },
    { name: "Sphynx", slug: "sphynx" },
];

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState<Message[]>([]);
    const [userStats, setUserStats] = useState<UserData[]>([]);
    const [connectedUsers, setConnectedUsers] = useState(0);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim() !== "") {
            socket.emit("chat message", message);
            setMessage("");
        }
    };

    const formatXAxis = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    useEffect(() => {
        socket.on("chat message", (msg: Message) => {
            setChatLog((prev) => [...prev, msg]);
        });

        socket.on("users count", (count: number) => {
            setConnectedUsers(count);
            setUserStats((prev) => {
                const newStats = [
                    ...prev,
                    {
                        timestamp: Date.now(),
                        count: count,
                    },
                ];
                return newStats.filter(
                    (stat) => Date.now() - stat.timestamp < 20 * 60 * 1000
                );
            });
        });

        return () => {
            socket.off("chat message");
            socket.off("users count");
        };
    }, []);

    return (
        <>
            <section className="text-gray-600 body-font">
                <div className="container flex flex-wrap px-5 py-5 mx-auto items-center">
                    <div className="md:w-1/2 md:pr-12 md:py-8 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200">
                        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
                            Welcome to my ChatGlobal!
                        </h1>
                        <p className="leading-relaxed text-base">
                            Cats move with quiet elegance, their curious eyes
                            always observing the world with wonder. They offer a
                            perfect mix of independence and affection, turning
                            everyday moments into peaceful companionship.
                        </p>
                        <a className="text-indigo-500 inline-flex items-center mt-4">
                            Learn More
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="w-4 h-4 ml-2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="flex flex-col md:w-1/2 md:pl-12">
                        <h2 className="title-font font-semibold text-gray-800 tracking-wider text-sm mb-3">
                            OTHER ROOMS
                        </h2>
                        <nav className="flex flex-wrap list-none -mb-1">
                            {catBreeds.map((breed) => (
                                <li
                                    key={breed.slug}
                                    className="lg:w-1/3 mb-1 w-1/2"
                                >
                                    <a
                                        href={`/chat/${breed.slug}`}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        {breed.name}
                                    </a>
                                </li>
                            ))}
                        </nav>
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <label
                                htmlFor="message"
                                className="absolute -top-6 left-0 text-sm text-gray-600"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hello, how are you?"
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-[180px] text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                            ></textarea>
                        </div>

                        {/* Widget graphique */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 w-64 h-[180px] flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-medium text-gray-700">
                                    Connectés:{" "}
                                    <span className="text-indigo-600 font-semibold">
                                        {connectedUsers}
                                    </span>
                                </h3>
                                <div className="text-xs text-gray-500">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={userStats}
                                        margin={{
                                            top: 2,
                                            right: 2,
                                            left: 2,
                                            bottom: 2,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={formatXAxis}
                                            interval="preserveStartEnd"
                                            tick={{ fontSize: 8 }}
                                            axisLine={{ stroke: "#e5e7eb" }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            domain={[0, "auto"]}
                                            tick={{ fontSize: 8 }}
                                            axisLine={{ stroke: "#e5e7eb" }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "0.375rem",
                                                fontSize: "10px",
                                                padding: "4px 8px",
                                            }}
                                            labelFormatter={(
                                                timestamp: number
                                            ) =>
                                                new Date(
                                                    timestamp
                                                ).toLocaleTimeString()
                                            }
                                            formatter={(value: number) => [
                                                `${value} utilisateurs`,
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#4f46e5"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{
                                                r: 3,
                                                fill: "#4f46e5",
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="text-white bg-cyan-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg w-fit"
                    >
                        Send
                    </button>
                </form>
            </div>
        </>
    );
}
