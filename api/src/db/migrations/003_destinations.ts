import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("destinations", function (t) {
    t.increments("id").notNullable().primary()
    t.string("province").notNullable()
    t.string("city").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("destinations")
}
