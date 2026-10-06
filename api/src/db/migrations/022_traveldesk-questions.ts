import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskQuestion", function (t) {
    t.increments("questionID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")

    t.datetime("creatingDate").notNullable()
    t.string("requestType").notNullable()
    t.string("question").notNullable()
    t.string("response")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskQuestion")
}
