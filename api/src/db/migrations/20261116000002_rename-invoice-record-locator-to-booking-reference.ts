import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.renameColumn("record_locator", "booking_reference")
  })
  await renameSnapshotReference(knex, "recordLocator", "bookingReference")
}

export async function down(knex: Knex): Promise<void> {
  await renameSnapshotReference(knex, "bookingReference", "recordLocator")
  await knex.schema.alterTable("travel_desk_invoices", (table) => {
    table.renameColumn("booking_reference", "record_locator")
  })
}

async function renameSnapshotReference(knex: Knex, oldKey: string, newKey: string): Promise<void> {
  await knex.raw(
    `
      UPDATE travel_desk_invoices
      SET source_snapshot = source_snapshot
        || CASE
          WHEN jsonb_typeof(source_snapshot -> 'bookingEvent') = 'object'
            AND jsonb_exists(source_snapshot -> 'bookingEvent', :oldKey)
          THEN jsonb_build_object(
            'bookingEvent',
            ((source_snapshot -> 'bookingEvent') - :oldKey)
              || jsonb_build_object(
                CAST(:newKey AS text),
                source_snapshot -> 'bookingEvent' -> :oldKey
              )
          )
          ELSE '{}'::jsonb
        END
        || CASE
          WHEN jsonb_typeof(source_snapshot -> 'serviceFeeEvents') = 'array'
          THEN jsonb_build_object(
            'serviceFeeEvents',
            (
              SELECT COALESCE(
                jsonb_agg(
                  CASE
                    WHEN jsonb_typeof(event) = 'object' AND jsonb_exists(event, :oldKey)
                    THEN (event - :oldKey)
                      || jsonb_build_object(CAST(:newKey AS text), event -> :oldKey)
                    ELSE event
                  END
                  ORDER BY position
                ),
                '[]'::jsonb
              )
              FROM jsonb_array_elements(source_snapshot -> 'serviceFeeEvents')
                WITH ORDINALITY AS events(event, position)
            )
          )
          ELSE '{}'::jsonb
        END
      WHERE jsonb_typeof(source_snapshot) = 'object'
    `,
    { oldKey, newKey }
  )
}
