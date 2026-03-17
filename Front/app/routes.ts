import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("./layout.tsx", [
    index("routes/home.tsx"),
    route("/chat", "routes/chat.tsx"),
    route("/chat/:roomId", "routes/roomId.tsx"),
    route("/memory", "routes/memory.tsx"),
  ]),
] satisfies RouteConfig