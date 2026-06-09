import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      status = 'expense_claim_traveller_changes_requested'
    WHERE
      status = 'expense_claim_changes_requested';
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_authorization_action_logs
    SET
      action = 'expense_claim_traveller_changes_requested'
    WHERE
      action = 'expense_claim_changes_requested';
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      status = 'expense_claim_changes_requested'
    WHERE
      status = 'expense_claim_traveller_changes_requested';
  `)
  await knex.raw(/* sql */ `
    UPDATE travel_authorization_action_logs
    SET
      action = 'expense_claim_changes_requested'
    WHERE
      action = 'expense_claim_traveller_changes_requested';
  `)
}
