import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE per_diems
    SET
      claim_type = CASE claim_type
        WHEN 'Breakfast' THEN 'breakfast'
        WHEN 'Lunch' THEN 'lunch'
        WHEN 'Dinner' THEN 'dinner'
        WHEN 'Incidentals' THEN 'incidentals'
        WHEN 'Private Accommodations' THEN 'private_accommodations'
        ELSE claim_type
      END
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE per_diems
    SET
      claim_type = CASE claim_type
        WHEN 'breakfast' THEN 'Breakfast'
        WHEN 'lunch' THEN 'Lunch'
        WHEN 'dinner' THEN 'Dinner'
        WHEN 'incidentals' THEN 'Incidentals'
        WHEN 'private_accommodations' THEN 'Private Accommodations'
        ELSE claim_type
      END
  `)
}
