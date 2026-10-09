import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("destinations", function (t) {
    t.increments("id").notNullable().primary()
    t.string("province").notNullable()
    t.string("city").notNullable()
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("destinations")
}
