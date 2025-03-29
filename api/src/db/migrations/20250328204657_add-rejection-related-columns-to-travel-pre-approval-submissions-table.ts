import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.integer("rejector_id").nullable()
    table.timestamp("rejected_at").nullable()

    table.foreign("rejector_id").references("users.id").onDelete("RESTRICT")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.dropForeign(["rejector_id"])
    table.dropColumn("rejector_id")
    table.dropColumn("rejected_at")
  })
}
