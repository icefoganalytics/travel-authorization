import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE "travel_authorization_pre_approvals"
    SET
      "status" = 'draft'
    WHERE
      "status" IS NULL
  `)

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.string("status").notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.string("status").nullable().alter()
  })
}
