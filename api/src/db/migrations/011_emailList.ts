import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("emailList", function (t) {
    t.increments("id").notNullable().primary()
    t.string("email").notNullable()
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("emailList")
}
