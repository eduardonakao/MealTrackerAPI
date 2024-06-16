import { FastifyReply, FastifyRequest } from "fastify";
import jwt  from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key"

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    if (request.url === "/login" || (request.url === "/users" && request.method === "POST")) {
        return
    }

    const authHeader = request.headers["authorization"]
    if (!authHeader) {
        return reply.status(401).send({
            error: "Missing authorization header"
        })
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string}
        request.user = decoded
    } catch (e) {
        return reply.status(401).send({
            error: "Invalid token"
        })
    }
}