import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    INSERT INTO
      "attachments" (
        "target_id",
        "target_type",
        "name",
        "size",
        "content",
        "mime_type"
      )
    SELECT
      "expenses"."id" AS "target_id",
      'Expense' AS "target_type",
      "expenses"."file_name" AS "name",
      "expenses"."file_size" AS "size",
      "expenses"."receipt_image" AS "content",
      'application/octet-stream' AS "mime_type"
    FROM
      "expenses"
    WHERE
      "expenses"."receipt_image" IS NOT NULL
      AND "expenses"."deleted_at" IS NULL
  `)

  await knex.schema.alterTable("expenses", (table) => {
    table.dropColumn("receipt_image")
    table.dropColumn("file_size")
    table.dropColumn("file_name")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("expenses", (table) => {
    table.binary("receipt_image")
    table.integer("file_size")
    table.string("file_name")
  })

  await knex.raw(/* sql */ `
    UPDATE "expenses"
    SET
      "receipt_image" = "attachments"."content",
      "file_size" = "attachments"."size",
      "file_name" = "attachments"."name"
    FROM
      "attachments"
    WHERE
      "attachments"."target_id" = "expenses"."id"
      AND "attachments"."target_type" = 'Expense'
      AND "attachments"."deleted_at" IS NULL
  `)
}
