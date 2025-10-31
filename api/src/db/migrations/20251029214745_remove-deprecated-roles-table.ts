import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable("roles")
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.createTable("roles", (table) => {
    table.increments("id").primary()
    table.string("name").notNullable()

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable()
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable()
    table.timestamp("deleted_at").nullable()

    table.unique(["name"], {
      indexName: "roles_name_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}
