import * as knex from "knex"

export function up(knex: knex.Knex) {
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

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("travelDeskQuestion")
}
