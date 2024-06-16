import { app } from "./app"
import { env } from "./env"
import dotenv from "dotenv";

app.listen({
    port: env.PORT,
}).then(() => {
    console.log("HTTP server running on port " + env.PORT)
})