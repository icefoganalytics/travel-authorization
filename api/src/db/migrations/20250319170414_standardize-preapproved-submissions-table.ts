import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_authorization_pre_approval_submissions", (table) => {
    table.increments("id").primary()
    table.integer("pre_approval_id").notNullable()
    table.integer("creator_id").notNullable()
    table.integer("approver_id")
    table.timestamp("approved_at")
    table.string("status").notNullable() // likely draft, submitted, approved, and declined.
    table.string("department").notNullable()

    // NOTE: submissionDate replaced by created_at timestamp since it seems to serve the same purpose.
    table.timestamps(true, true)
    table.timestamp("deleted_at")

    table
      .foreign("pre_approval_id")
      .references("travel_authorization_pre_approvals.id")
      .onDelete("CASCADE")
    table.foreign("creator_id").references("users.id").onDelete("RESTRICT")
    table.foreign("approver_id").references("users.id").onDelete("RESTRICT")
  })

  await knex.schema.alterTable("preapprovedDocuments", (table) => {
    table.dropForeign("preTSubID")
    table.dropColumn("preTSubID")

    table.integer("submission_id").notNullable()
    table
      .foreign("submission_id")
      .references("travel_authorization_pre_approval_submissions.id")
      .onDelete("CASCADE")
  })

  // NOTE: I think this relationship was backwards?
  // the travel_authorization_pre_approvals record gets created first and then has a travel_authorization_pre_approval_submissions
  // record associated with it during approval/rejection.
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    // now this key exists in travel_authorization_pre_approval_submissions as submission_id
    table.dropForeign("submission_id")
    table.dropColumn("submission_id")
  })

  // NOTE: not migrating data as old data was not using user ids
  await knex.schema.dropTable("preapprovedSubmissions")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("preapprovedSubmissions", (table) => {
    table.increments("preTSubID").primary()
    table.string("submitter").notNullable()
    table.string("status").notNullable()
    table.date("submissionDate").defaultTo(knex.raw("CURRENT_DATE"))
    table.date("approvalDate")
    table.string("approvedBy")
    table.string("department")
  })

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.integer("submission_id")
    table
      .foreign("submission_id")
      .references("preapprovedSubmissions.preTSubID")
      .onDelete("SET NULL")
  })

  await knex.schema.alterTable("preapprovedDocuments", (table) => {
    table.dropForeign("submission_id")
    table.dropColumn("submission_id")

    table.integer("preTSubID").notNullable()
    table.foreign("preTSubID").references("preapprovedSubmissions.preTSubID").onDelete("CASCADE")
  })

  // NOTE: not migrating data as we didn't migrate data up.
  await knex.schema.dropTable("travel_authorization_pre_approval_submissions")
}
