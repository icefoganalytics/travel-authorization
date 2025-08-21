import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("attachments", (table) => {
    table.increments("id").primary()

    table.integer("target_id").notNullable()
    table.string("target_type", 255).notNullable()

    table.string("name", 255).notNullable()
    table.integer("size").notNullable()
    table.binary("content").notNullable()
    table.string("mime_type", 255).notNullable()

    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table.unique(["target_id", "target_type"], {
      indexName: "attachments_target_id_target_type_expense_unique",
      predicate: knex.whereRaw("target_type = 'Expense'").whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("attachments")
}
