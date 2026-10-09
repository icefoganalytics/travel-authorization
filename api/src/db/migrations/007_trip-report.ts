import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("tripReports", function (t) {
    t.increments("id").notNullable().primary()
    t.integer("taid").notNullable().unique()
    t.string("costDifferenceExplanation")
    t.string("skillsGained")
    t.string("applicationTimeframe")
    t.string("benefitsToUnit")
    t.string("benefitsToYG")
    t.string("futureRecommendations")
    t.string("reportStatus")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("tripReports")
}
