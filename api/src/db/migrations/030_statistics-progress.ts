import * as knex from "knex"

export const up = function (knex: knex.Knex) {
  return knex.schema.createTable("StatisticsProgress", function (t) {
    t.increments("id").notNullable().primary()
    t.dateTime("last_update").notNullable()

    t.integer("progress")
  })
}

export const down = function (knex: knex.Knex) {
  return knex.schema.dropTable("StatisticsProgress")
}
