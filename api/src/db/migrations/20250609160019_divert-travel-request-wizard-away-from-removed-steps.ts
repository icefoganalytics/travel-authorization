import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-flight-options'
    WHERE
      wizard_step_name = 'review-request-details'
  `)
}

export async function down(_knex: Knex): Promise<void> {
  // Do nothing since this migration is not conceptually reversible
}
