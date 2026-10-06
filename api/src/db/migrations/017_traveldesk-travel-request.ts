import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskTravelRequest", function (t) {
    t.increments("requestID").notNullable().primary()
    t.integer("TAID").unsigned().notNullable()
    t.foreign("TAID").references("id").inTable("forms").onDelete("CASCADE")

    t.string("legalFirstName").notNullable()
    t.string("legalMiddleName")
    t.string("legalLastName").notNullable()
    t.string("birthDate")
    t.string("strAddress").notNullable()
    t.string("city").notNullable()
    t.string("province").notNullable()
    t.string("postalCode").notNullable()
    t.string("passportCountry")
    t.string("passportNum")
    t.string("travelPurpose").notNullable()
    t.string("travelLocation")
    t.string("travelNotes")
    t.string("busPhone").notNullable()
    t.string("busEmail").notNullable()
    t.boolean("travelContact")
    t.string("travelPhone")
    t.string("travelEmail")
    t.string("additionalInformation")

    t.string("status").notNullable() //draft, submitted, options_provided, options_ranked, booked
    t.datetime("submitDate")
    t.string("travelDeskOfficer")

    t.integer("agencyID").unsigned()
    t.foreign("agencyID")
      .references("agencyID")
      .inTable("travelDeskTravelAgent")
      .onDelete("SET NULL")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskTravelRequest")
}
