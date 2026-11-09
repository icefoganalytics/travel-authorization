import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("roles", function (t) {
    t.increments("id").notNullable().primary()
    t.string("name").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("roles")
}
