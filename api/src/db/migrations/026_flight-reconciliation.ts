import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("flightReconciliation", function (t) {
    t.increments("reconcileID").notNullable().primary()
    t.integer("invoiceID").unsigned().notNullable()
    t.integer("invoiceDetailID").unsigned().notNullable().unique()
    t.boolean("reconciled").defaultTo(false)
    t.integer("reconcilePeriod")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("flightReconciliation")
}
