import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-finance-review-and-processing'
    WHERE
      wizard_step_name = 'review-expenses'
      AND "status" != 'expensed'
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'review-expenses'
    WHERE
      wizard_step_name = 'awaiting-finance-review-and-processing'
      AND "status" != 'expensed'
  `)
}
