import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("YgDepartments", function (t) {
    t.increments("id").notNullable().primary()
    t.dateTime("update_date").notNullable()

    t.string("department")
    t.string("division")
    t.string("branch")
    t.string("unit")
    t.integer("order")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("YgDepartments")
}
