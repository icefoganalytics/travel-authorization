import * as knex from "knex"

export const up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("distanceMatrix", function (t) {
    t.increments("id").notNullable().primary()
    t.string("origin")
    t.string("destination")
    t.float("kilometers")
  })
}

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("distanceMatrix")
}
