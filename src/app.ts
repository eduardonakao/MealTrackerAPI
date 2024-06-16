import fastify from "fastify";
import { userRouter } from "./routes/userRouter";
import { mealRouter } from "./routes/mealRouter";

export const app = fastify()

app.register(userRouter)
app.register(mealRouter)