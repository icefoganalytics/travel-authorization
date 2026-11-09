import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("departments", function (t) {
    t.increments("id").notNullable().primary()
    t.string("name").notNullable()
    t.string("type").notNullable()
    t.integer("ownedBy").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("departments")
}
