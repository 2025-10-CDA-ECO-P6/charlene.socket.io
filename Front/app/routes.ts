import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("./layout.tsx", [
    index("routes/home.tsx"),
    route("/chat", "routes/chat.tsx"),
    route("/chat/:roomId", "routes/roomId.tsx"),
    route("/memory", "routes/memory.tsx"),
    route("/puissance4", "routes/puissance4.tsx"),
    route("/puissance4/:roomId", "routes/puissance4Game.tsx"),
  ]),
] satisfies RouteConfig