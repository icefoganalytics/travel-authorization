import * as knex from "knex"

export function up(knex: knex.Knex) {
  return knex.schema.createTable("forms", function (t) {
    t.increments("id").notNullable().primary()
    t.integer("userId").notNullable()
    t.string("firstName")
    t.string("lastName")
    t.string("department")
    t.string("division")
    t.string("branch")
    t.string("unit")
    t.string("email")
    t.string("mailcode")
    t.integer("daysOffTravelStatus")
    t.specificType("dateBackToWork", "DATE")
    t.integer("travelDuration")
    t.string("purpose")
    t.integer("travelAdvance")
    t.string("eventName")
    t.string("summary")
    t.string("benefits")
    t.string("status")
    t.string("formId").notNullable().unique()
    t.string("supervisorEmail")
    t.integer("preappId")
    t.string("approved")
    t.string("requestChange")
    t.string("denialReason")
    t.boolean("oneWayTrip")
    t.boolean("multiStop")
    t.integer("createdBy")
  })
}

export function down(knex: knex.Knex) {
  return knex.schema.dropTable("forms")
}
