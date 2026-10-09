import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("YgEmployees", function (t) {
    t.increments("id").notNullable().primary()
    t.dateTime("update_date").notNullable()

    t.string("full_name")
    t.string("first_name")
    t.string("last_name")
    t.string("organization")
    t.string("department")
    t.string("division")
    t.string("branch")
    t.string("unit")
    t.string("title")
    t.string("email")
    t.string("suite")
    t.string("phone_office")
    t.string("fax_office")
    t.string("mobile")
    t.string("office")
    t.string("address")
    t.string("po_box")
    t.string("community")
    t.string("postal_code")
    t.string("latitude")
    t.string("longitude")
    t.string("mailcode")
    t.string("manager")
    t.string("username")
  })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("YgEmployees")
}
