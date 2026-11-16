import { Knex } from "knex"

const BUILT_IN_PRODUCT_TYPES = [
  { code: "air", name: "Air" },
  { code: "service-fee", name: "Service Fee" },
  { code: "credit", name: "Credit" },
  { code: "change-fee", name: "Change Fee" },
]

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_product_types", (table) => {
    table.increments("id").primary()
    table.string("code").notNullable()
    table.string("name").notNullable()
    table.text("description")

    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table.unique("code", {
      indexName: "travel_desk_product_types_code_unique",
      predicate: knex.whereNull("deleted_at"),
    })
    table.unique("name", {
      indexName: "travel_desk_product_types_name_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })

  await knex("travel_desk_product_types").insert(BUILT_IN_PRODUCT_TYPES)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("travel_desk_product_types")
}
