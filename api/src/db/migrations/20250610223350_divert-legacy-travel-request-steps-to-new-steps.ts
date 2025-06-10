import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  // review-expenses
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-expense-claim-approval-and-processing'
    WHERE
      wizard_step_name = 'review-expenses'
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'review-expenses'
    WHERE
      wizard_step_name = 'awaiting-expense-claim-approval-and-processing'
  `)
}
