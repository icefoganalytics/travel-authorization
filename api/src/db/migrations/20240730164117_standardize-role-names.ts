import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE roles
    SET
      "name" = CASE "name"
        WHEN 'pat_admin' THEN 'pre_approved_travel_admin'
        WHEN 'td_user' THEN 'travel_desk_user'
        ELSE "name"
      END
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE roles
    SET
      "name" = CASE "name"
        WHEN 'pre_approved_travel_admin' THEN 'pat_admin'
        WHEN 'travel_desk_user' THEN 'td_user'
        ELSE "name"
      END
  `)
}
