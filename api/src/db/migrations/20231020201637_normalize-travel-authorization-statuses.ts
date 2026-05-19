import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      status = CASE
        WHEN status = 'Draft' THEN 'draft'
        WHEN status = 'Submitted' THEN 'submitted'
        WHEN status = 'Approved' THEN 'approved'
        WHEN status = 'Denied' THEN 'denied'
        WHEN status = 'Change Requested' THEN 'change_requested'
        WHEN status = 'Expensed' THEN 'expensed'
        ELSE status
      END;
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      status = CASE
        WHEN status = 'draft' THEN 'Draft'
        WHEN status = 'submitted' THEN 'Submitted'
        WHEN status = 'approved' THEN 'Approved'
        WHEN status = 'denied' THEN 'Denied'
        WHEN status = 'change_requested' THEN 'Change Requested'
        WHEN status = 'expensed' THEN 'Expensed'
        ELSE status
      END;
  `)
}
