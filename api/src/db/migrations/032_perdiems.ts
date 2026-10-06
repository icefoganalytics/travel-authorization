import * as knex from "knex"

export const up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("perDiems", function (t) {
    t.increments("id").notNullable().primary()
    t.string("claim")
    t.string("location")
    t.float("amount")
    t.string("currency")
  })
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("perDiems")
}
