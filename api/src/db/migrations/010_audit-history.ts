import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("auditHistory", function (t) {
    t.increments("id").notNullable().primary()
    t.string("userId")
    t.string("taid")
    t.string("action")
    t.string("note")
    t.datetime("timestamp")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("auditHistory")
}
