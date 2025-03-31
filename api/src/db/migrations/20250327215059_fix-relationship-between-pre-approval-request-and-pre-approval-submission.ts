import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.integer("submission_id")

    table
      .foreign("submission_id")
      .references("travel_authorization_pre_approval_submissions.id")
      .onDelete("SET NULL")

    table.unique("submission_id", {
      indexName: "travel_authorization_pre_approvals_submission_id_unique",
      predicate: knex.whereNull("submission_id").whereNull("deleted_at"),
    })
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorization_pre_approvals
    SET
      submission_id = travel_authorization_pre_approval_submissions.id
    FROM
      travel_authorization_pre_approval_submissions
    WHERE
      travel_authorization_pre_approval_submissions.pre_approval_id = travel_authorization_pre_approvals.id
  `)

  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.dropForeign("pre_approval_id")
    table.dropColumn("pre_approval_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_submissions", (table) => {
    table.integer("pre_approval_id").notNullable()
    table
      .foreign("pre_approval_id")
      .references("travel_authorization_pre_approvals.id")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorization_pre_approval_submissions
    SET
      pre_approval_id = travel_authorization_pre_approvals.id
    FROM
      travel_authorization_pre_approvals
    WHERE
      travel_authorization_pre_approvals.id = travel_authorization_pre_approval_submissions.pre_approval_id
  `)

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropForeign("submission_id")
    table.dropColumn("submission_id")
  })
}
