import * as knex from "knex"

export function up(knex: knex.Knex) {
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

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("tripReports")
}
