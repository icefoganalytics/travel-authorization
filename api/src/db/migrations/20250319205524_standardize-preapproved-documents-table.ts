import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_authorization_pre_approval_documents", (table) => {
    table.increments("id").primary()
    table.integer("submission_id").notNullable()
    table.binary("approval_document").notNullable()

    table.timestamps(true, true)
    table.timestamp("deleted_at").nullable()

    table
      .foreign("submission_id")
      .references("travel_authorization_pre_approval_submissions.id")
      .onDelete("CASCADE")
  })

  // NOTE: not migrating data as I didn't migrate travel pre-approval submission data due to lacking user ids.
  await knex.schema.dropTable("preapprovedDocuments")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("preapprovedDocuments", (table) => {
    table.increments("preTDocID").primary()
    table.integer("submission_id").notNullable()
    table.binary("approvalDoc").nullable()

    table
      .foreign("submission_id")
      .references("travel_authorization_pre_approval_submissions.id")
      .onDelete("CASCADE")
  })

  await knex.schema.dropTable("travel_authorization_pre_approval_documents")
}
