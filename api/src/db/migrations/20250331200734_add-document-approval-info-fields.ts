import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.string("approval_document_approver_name")
    table.date("approval_document_approved_on")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorization_pre_approval_documents
    SET
      approval_document_approver_name = 'UNKNOWN',
      approval_document_approved_on = created_at
  `)

  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.string("approval_document_approver_name").notNullable().alter()
    table.date("approval_document_approved_on").notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.dropColumn("approval_document_approver_name")
    table.dropColumn("approval_document_approved_on")
  })
}
