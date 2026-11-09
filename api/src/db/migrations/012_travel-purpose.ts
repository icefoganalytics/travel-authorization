import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("travelPurpose", function (t) {
    t.increments("id").notNullable().primary()
    t.string("purpose").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("travelPurpose")
}
