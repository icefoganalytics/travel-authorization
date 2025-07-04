import { Knex } from "knex"

/**
 * Reverts api/src/db/migrations/20231027211536_convert-users-roles-to-a-string-array.ts
 * Because Sequelize 7 string arrays don't work with scopes due to a open bug.
 */
export async function up(knex: Knex): Promise<void> {
  // Add a temporary column to hold the comma-separated string values
  await knex.schema.alterTable("users", (table) => {
    table.string("roles_string").notNullable().defaultTo("")
  })

  // Convert the array to a comma-separated string
  await knex.raw(`
    UPDATE "users"
    SET roles_string = ARRAY_TO_STRING(roles, ',')
  `)

  // Drop the old column and rename the new column
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("roles")
    table.renameColumn("roles_string", "roles")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Add a temporary column to hold the array values
    table
      .specificType("roles_array", "varchar(255)[]")
      .notNullable()
      .defaultTo(knex.raw("ARRAY[]::varchar[]"))
  })

  // Convert the comma-separated string to an array
  await knex.raw(`
    UPDATE "users"
    SET roles_array = STRING_TO_ARRAY(roles, ',')
  `)

  // Drop the old column and rename the new column
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("roles")
    table.renameColumn("roles_array", "roles")
  })
}
