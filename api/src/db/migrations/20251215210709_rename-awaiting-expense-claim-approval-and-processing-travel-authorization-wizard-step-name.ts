import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-expense-claim-approval'
    WHERE
      wizard_step_name = 'awaiting-expense-claim-approval-and-processing';
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-expense-claim-approval-and-processing'
    WHERE
      wizard_step_name = 'awaiting-expense-claim-approval';
  `)
}
