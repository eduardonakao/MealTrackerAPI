import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("meals", (table) => {
        table.uuid("meal_id").primary().defaultTo(knex.raw("gen_random_uuid"))
        table.uuid("user_id").notNullable().references("user_id").inTable("users").onDelete("CASCADE")
        table.string("name").notNullable()
        table.text("description")
        table.timestamp("date_time").notNullable()
        table.boolean("is_within_diet").notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("meals")
}

