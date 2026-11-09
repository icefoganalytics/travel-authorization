import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("auditHistory", function (t) {
    t.increments("id").notNullable().primary()
    t.string("userId")
    t.string("taid")
    t.string("action")
    t.string("note")
    t.datetime("timestamp")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("auditHistory")
}
