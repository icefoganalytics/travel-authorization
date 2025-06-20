import { type Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'review-expenses'
    WHERE
      "status" = 'expense_claim_approved'
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = 'awaiting-expense-claim-approval-and-processing'
    WHERE
      wizard_step_name = 'review-expenses'
  `)
}
