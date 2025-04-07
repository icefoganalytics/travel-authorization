import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.unique(["pre_approval_id"], {
      indexName: "travel_authorization_pre_approval_submissions_pre_approval_id_u",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.dropIndex(
      ["pre_approval_id"],
      "travel_authorization_pre_approval_submissions_pre_approval_id_u"
    )
  })
}
