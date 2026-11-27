import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex("travel_authorization_pre_approvals")
    .whereNull("department")
    .orWhereRaw("department !~ '[^[:space:]]'")
    .update({ department: "UNKNOWN" })

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropNullable("department")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.setNullable("department")
  })
}
