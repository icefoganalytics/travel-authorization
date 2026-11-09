import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("user", function (t) {
    t.increments("id").notNullable().primary()
    t.string("sub").notNullable()
    t.string("email").notNullable()
    t.string("status").notNullable().defaultTo("Inactive")
    t.string("first_name")
    t.string("last_name")
    t.string("roles", 1000)
    t.timestamp("create_date").notNullable().defaultTo(knex.fn.now())
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("user")
}
