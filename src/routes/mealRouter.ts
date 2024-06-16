import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import { z } from "zod";
import { knex }from "../database";
import { randomUUID } from "crypto";


export async function mealRouter(app: FastifyInstance) {
    // Registrar o Middleware
    app.addHook("preHandler", authMiddleware)

    // Rota para obter todas as refeições de um usuário
    app.get("/meals", async (request, reply) => {
        const userId = request.user?.userId
        const meals = await knex("meals").where({ user_id: userId }).select("*")
        return meals
    })

    app.get("/meals/:meal_id", async (request, replay) => {
        const mealIdSchema = z.object({
            meal_id: z.string().uuid()
        })

        const { meal_id } = mealIdSchema.parse(request.params)
        const userId = request.user?.userId

        //Verificar se a refeição pertence ao usuário
        const meal = await knex("meals").where({ meal_id, user_id: userId }).first()
        if(!meal) {
            return replay.status(404).send({ error: "Meal not found"})
        }

        return meal
    })

    // Rota para criar uma nova refeição
    app.post("/meals", async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date_time: z.string().datetime(),
            is_within_diet: z.boolean()
        })

        const { name, description, date_time, is_within_diet } = createMealBodySchema.parse(request.body)

        await knex("meals").insert({
            meal_id: randomUUID(),
            user_id: request.user?.userId,
            name,
            description,
            date_time,
            is_within_diet,
        })

        return reply.status(201).send("Meal successfully created")
    })

    // Rota para editar uma refeição existente
    app.put("/meals/:meal_id", async (request, reply) => {
        const mealIdSchema = z.object({
            meal_id: z.string().uuid()
        })

        const updateMealBodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            date_time: z.string().optional(),
            is_within_diet: z.boolean().optional()
        })

        const { meal_id } = mealIdSchema.parse(request.params)
        const { name, description, date_time, is_within_diet } = updateMealBodySchema.parse(request.body)

        const userId = request.user?.userId

        //Verificar se a refeição pertence ao usuário
        const meal = await knex("meals").where({meal_id, user_id: userId }).first()
        if(!meal) {
            return reply.status(404).send({ error: "meal nor found"})
        }

        //Atualizando a refeição

        await knex("meals").where({ meal_id }).update({
            name: name !== undefined ? name : meal.name,
            description: description !== undefined ? description : meal.description,
            date_time: date_time !== undefined ? date_time : meal.date_time,
            is_within_diet: is_within_diet !== undefined ? is_within_diet : meal.is_within_diet
        })

        return reply.status(200).send("Meal successfully updated")
    })

    //Rota para deletar uma refeição existente
    app.delete("/meals/:meal_id", async (request, reply) => {
        const mealIdSchema = z.object({
            meal_id: z.string().uuid()
        })

        const { meal_id } = mealIdSchema.parse(request.params)

        const userId = request.user?.userId

        //Verficar se a refeição pertence ao usuário
        const meal = await knex("meals").where({ meal_id, user_id: userId }).first()
        if(!meal) {
            return reply.status(404).send({ error: "Meal not found"})
        }

        //Deletar a refeição
        await knex("meals").where({ meal_id }).del()

        return reply.status(200).send("Meal successfully deleted")
    })

    // Rota para obter as métricas do usuário
  app.get("/meals/metrics", async (request, reply) => {
    const userId = request.user?.userId;

    // Quantidade total de refeições registradas
    const totalMeals = await knex("meals").where({ user_id: userId }).count('* as count');
    const totalMealsCount = totalMeals[0].count;

    // Quantidade total de refeições dentro da dieta
    const withinDietMeals = await knex("meals").where({ user_id: userId, is_within_diet: true }).count('* as count');
    const withinDietMealsCount = withinDietMeals[0].count;

    // Quantidade total de refeições fora da dieta
    const outsideDietMeals = await knex("meals").where({ user_id: userId, is_within_diet: false }).count('* as count');
    const outsideDietMealsCount = outsideDietMeals[0].count;

    // Melhor sequência de refeições dentro da dieta
    const meals = await knex("meals").where({ user_id: userId }).orderBy('date_time', 'asc');
    let bestStreak = 0;
    let currentStreak = 0;

    for (const meal of meals) {
      if (meal.is_within_diet) {
        currentStreak++;
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalMeals: totalMealsCount,
      withinDietMeals: withinDietMealsCount,
      outsideDietMeals: outsideDietMealsCount,
      bestStreak,
    };
  });
}