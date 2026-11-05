import * as knex from "knex"

exports.up = function (knex: knex.Knex) {
  return knex.schema.createTable("flightReconciliation", function (t) {
    t.increments("reconcileID").notNullable().primary()
    t.integer("invoiceID").unsigned().notNullable()
    t.integer("invoiceDetailID").unsigned().notNullable().unique()
    t.boolean("reconciled").defaultTo(false)
    t.integer("reconcilePeriod")
  })
}

exports.down = function (knex: knex.Knex) {
  return knex.schema.dropTable("flightReconciliation")
}
