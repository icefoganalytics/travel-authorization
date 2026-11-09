import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("StatisticsProgress", function (t) {
    t.increments("id").notNullable().primary()
    t.dateTime("last_update").notNullable()

    t.integer("progress")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("StatisticsProgress")
}
