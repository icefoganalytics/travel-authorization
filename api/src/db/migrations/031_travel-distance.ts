import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("distanceMatrix", function (t) {
    t.increments("id").notNullable().primary()
    t.string("origin")
    t.string("destination")
    t.float("kilometers")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("distanceMatrix")
}
