import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import bcrypt from 'bcrypt';
import { authMiddleware } from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function userRouter(app: FastifyInstance) {

    // Registrar o middleware
  app.addHook("preHandler", authMiddleware);
  
  // Rota para obter todos os usuários
  app.get("/users", async () => {
    const users = await knex("users").select("*");
    return users;
  });

  // Rota para criar um novo usuário
  app.post("/users", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    // Verificar se o e-mail já existe
    const existingUser = await knex("users").where({ email }).first();

    if (existingUser) {
      return reply.status(400).send({ error: "Email already exists" });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    await knex("users").insert({
      user_id: randomUUID(),
      name,
      email,
      password: hashedPassword
    });

    return reply.status(201).send("User successfully created");
  });

  // Rota para login
  app.post("/login", async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = loginBodySchema.parse(request.body);

    const user = await knex("users").where({ email }).first();

    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    // Gerar o token JWT
    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });


    return reply.status(200).send({ message: "Login successful", token });
  });
}
