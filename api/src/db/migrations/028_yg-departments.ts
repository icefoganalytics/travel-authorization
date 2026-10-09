import * as knex from "knex"

export const up = function (knex: knex.Knex, Promise: any) {
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

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("YgDepartments")
}
