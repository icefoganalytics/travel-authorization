import * as knex from "knex"

export function up(knex: knex.Knex) {
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

export function down(knex: knex.Knex) {
  return knex.schema
    .alterTable("user", function (t) {
      t.dropColumn("department")
    })
    .dropTable("preapprovedDocuments")
}
