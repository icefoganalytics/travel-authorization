import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE expenses
    SET
      type = 'Expense',
      updated_at = NOW()
    WHERE
      type = 'Expenses'
  `)
  await knex.raw(/* sql */ `
    UPDATE expenses
    SET
      type = 'Estimate',
      updated_at = NOW()
    WHERE
      type = 'Estimates'
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE expenses
    SET
      type = 'Expenses',
      updated_at = NOW()
    WHERE
      type = 'Expense'
  `)
  await knex.raw(/* sql */ `
    UPDATE expenses
    SET
      type = 'Estimates',
      updated_at = NOW()
    WHERE
      type = 'Estimate'
  `)
}
