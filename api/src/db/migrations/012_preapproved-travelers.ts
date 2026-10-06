import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("preapprovedTravelers", function (t) {
    t.increments("travelerID").notNullable().primary()
    t.integer("preTID").unsigned().notNullable()
    t.foreign("preTID").references("preTID").inTable("preapproved").onDelete("CASCADE")
    t.string("fullName").notNullable()
    t.string("department").notNullable()
    t.string("branch")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("preapprovedTravelers")
}
