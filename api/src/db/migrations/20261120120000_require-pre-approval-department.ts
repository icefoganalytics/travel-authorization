import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // A missing owner must not be guessed from the creator or traveler profiles.
  await knex("travel_authorization_pre_approvals")
    .whereNull("department")
    .orWhereRaw("department !~ '[^[:space:]]'")
    .update({ department: "UNKNOWN" })

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropNullable("department")
    table.check("department ~ '[^[:space:]]'", [], "pre_approval_department_not_blank")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropChecks("pre_approval_department_not_blank")
    table.setNullable("department")
  })
}
