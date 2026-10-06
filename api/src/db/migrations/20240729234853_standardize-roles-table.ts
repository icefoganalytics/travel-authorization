import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("roles", (table) => {
    table.timestamps(true, true)
    table.timestamp("deleted_at")
  })

  // Set deleted_at for duplicate roles
  await knex.raw(/* sql */ `
    WITH
      ranked_roles AS (
        SELECT
          id,
          "name",
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY
              "name"
            ORDER BY
              created_at DESC
          ) AS row_number
        FROM
          "roles"
        WHERE
          deleted_at IS NULL
      )
    UPDATE "roles"
    SET
      deleted_at = NOW()
    FROM
      ranked_roles
    WHERE
      "roles".id = ranked_roles.id
      AND ranked_roles.row_number > 1;
  `)

  await knex.schema.alterTable("roles", (table) => {
    table.unique(["name"], {
      indexName: "roles_name_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("roles", (table) => {
    table.dropIndex(["name"], "roles_name_unique")
    // Drop unique doesn't seem to work here
    // table.dropUnique(["name"], "roles_name_unique")
  })

  await knex.schema.alterTable("roles", (table) => {
    table.dropTimestamps()
    table.dropColumn("deleted_at")
  })
}
