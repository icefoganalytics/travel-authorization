import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("departments", function (t) {
    t.increments("id").notNullable().primary()
    t.string("name").notNullable()
    t.string("type").notNullable()
    t.integer("ownedBy").notNullable()
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("departments")
}
