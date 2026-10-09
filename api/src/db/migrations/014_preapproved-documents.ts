import * as knex from "knex"

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema
    .createTable("preapprovedDocuments", function (t) {
      t.increments("preTDocID").notNullable().primary()
      t.integer("preTSubID").unsigned()
      t.foreign("preTSubID")
        .references("preTSubID")
        .inTable("preapprovedSubmissions")
        .onDelete("CASCADE")
      t.binary("approvalDoc")
    })
    .alterTable("user", function (t) {
      t.string("department")
    })
}

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema
    .alterTable("user", function (t) {
      t.dropColumn("department")
    })
    .dropTable("preapprovedDocuments")
}
