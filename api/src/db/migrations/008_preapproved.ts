import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("preapproved", function (t) {
    t.increments("preTID").notNullable().primary()
    t.string("department")
    t.string("branch")
    t.string("purpose")
    t.string("reason")
    t.date("startDate")
    t.date("endDate")
    t.integer("dateUnkInd").notNullable()
    t.string("month")
    t.integer("estimatedCost").notNullable()
    t.integer("travelerUnkInd").notNullable()
    t.integer("numberTravelers")
    t.string("travelerNotes")
    t.string("location").notNullable()
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("preapproved")
}
