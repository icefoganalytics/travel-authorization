import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("travelDeskHotel", function (t) {
    t.increments("hotelID").notNullable().primary()
    t.integer("requestID").unsigned().notNullable()
    t.foreign("requestID")
      .references("requestID")
      .inTable("travelDeskTravelRequest")
      .onDelete("CASCADE")

    t.string("city")

    t.boolean("rsvConferenceHotel")
    t.string("conferenceName")
    t.string("conferenceHotelName")

    t.date("checkIn")
    t.date("checkOut")

    t.string("additionalInformation")

    t.string("status").notNullable()

    t.string("reservedHotelInfo")
    t.string("booking")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("travelDeskHotel")
}
