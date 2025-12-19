import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("expenses", (table) => {
    table.integer("approver_id").nullable()
    table.timestamp("approved_at").nullable()

    table.integer("rejector_id").nullable()
    table.timestamp("rejected_at").nullable()
    table.text("rejection_note").nullable()

    table.foreign("approver_id").references("users.id")
    table.foreign("rejector_id").references("users.id")
  })
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("expenses", (table) => {
    table.dropForeign("approver_id")
    table.dropForeign("rejector_id")

    table.dropColumn("approver_id")
    table.dropColumn("approved_at")
    table.dropColumn("rejector_id")
    table.dropColumn("rejected_at")
    table.dropColumn("rejection_note")
  })
}
