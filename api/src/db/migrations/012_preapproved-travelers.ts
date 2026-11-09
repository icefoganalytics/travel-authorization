import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("preapprovedTravelers", function (t) {
    t.increments("travelerID").notNullable().primary()
    t.integer("preTID").unsigned().notNullable()
    t.foreign("preTID").references("preTID").inTable("preapproved").onDelete("CASCADE")
    t.string("fullName").notNullable()
    t.string("department").notNullable()
    t.string("branch")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("preapprovedTravelers")
}
