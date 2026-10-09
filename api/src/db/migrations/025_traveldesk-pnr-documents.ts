import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskPnrDocuments", function (t) {
    t.increments("documentID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")
    t.binary("pnrDocument")
    t.string("invoiceNumber")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskPnrDocuments")
}
