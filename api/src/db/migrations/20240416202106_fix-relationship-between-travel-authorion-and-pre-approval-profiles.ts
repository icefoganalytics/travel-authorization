import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("pre_approval_profile_id").unsigned().nullable()

    table
      .foreign("pre_approval_profile_id")
      .references("id")
      .inTable("travel_authorization_pre_approval_profiles")
      .onDelete("RESTRICT")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      pre_approval_profile_id = pre_approval_profiles.id
    FROM
      (
        SELECT DISTINCT
          ON (
            travel_authorization_pre_approval_profiles.pre_approval_id
          ) travel_authorization_pre_approval_profiles.id,
          travel_authorization_pre_approval_profiles.pre_approval_id
        FROM
          travel_authorization_pre_approval_profiles
        ORDER BY
          travel_authorization_pre_approval_profiles.pre_approval_id
      ) AS pre_approval_profiles
    WHERE
      travel_authorizations.pre_approval_id = pre_approval_profiles.pre_approval_id
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropForeign(["pre_approval_id"])
    table.dropColumn("pre_approval_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("pre_approval_id").unsigned().nullable()

    table
      .foreign("pre_approval_id")
      .references("id")
      .inTable("travel_authorization_pre_approval_profiles")
      .onDelete("RESTRICT")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      pre_approval_id = pre_approval_profiles.pre_approval_id
    FROM
      (
        SELECT DISTINCT
          ON (
            travel_authorization_pre_approval_profiles.pre_approval_id
          ) travel_authorization_pre_approval_profiles.id,
          travel_authorization_pre_approval_profiles.pre_approval_id
        FROM
          travel_authorization_pre_approval_profiles
        ORDER BY
          travel_authorization_pre_approval_profiles.pre_approval_id
      ) AS pre_approval_profiles
    WHERE
      travel_authorizations.pre_approval_profile_id = pre_approval_profiles.id
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropForeign(["pre_approval_profile_id"])
    table.dropColumn("pre_approval_profile_id")
  })
}
