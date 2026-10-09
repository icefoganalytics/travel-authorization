import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("emailList", function (t) {
    t.increments("id").notNullable().primary()
    t.string("email").notNullable()
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("emailList")
}
