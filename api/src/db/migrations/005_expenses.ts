import * as knex from "knex"

exports.up = function (knex: knex.Knex) {
  return knex.schema.createTable("expenses", function (t) {
    t.increments("id").notNullable().primary()
    t.integer("taid").notNullable()
    t.string("description").notNullable()
    t.specificType("date", "DATE")
    t.float("cost").notNullable()
    t.string("currency").notNullable()
    t.string("type").notNullable()
    t.binary("receiptImage")
    t.integer("fileSize")
    t.string("fileName")
  })
}

exports.down = function (knex: knex.Knex) {
  return knex.schema.dropTable("expenses")
}
