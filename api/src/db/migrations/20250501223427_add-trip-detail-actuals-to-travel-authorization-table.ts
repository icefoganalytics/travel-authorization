import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("days_off_travel_status_estimate").nullable()
    table.integer("days_off_travel_status_actual").nullable()

    table.date("date_back_to_work_estimate").nullable()
    table.date("date_back_to_work_actual").nullable()

    table.integer("travel_duration_estimate").nullable()
    table.integer("travel_duration_actual").nullable()

    table.string("trip_type_estimate").nullable()
    table.string("trip_type_actual").nullable()
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      days_off_travel_status_estimate = days_off_travel_status,
      date_back_to_work_estimate = date_back_to_work,
      travel_duration_estimate = travel_duration,
      trip_type_estimate = trip_type
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("days_off_travel_status")
    table.dropColumn("date_back_to_work")
    table.dropColumn("travel_duration")
    table.dropColumn("trip_type")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.integer("days_off_travel_status").nullable()
    table.date("date_back_to_work").nullable()
    table.integer("travel_duration").nullable()
    table.string("trip_type").nullable()
  })

  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      days_off_travel_status = days_off_travel_status_estimate,
      date_back_to_work = date_back_to_work_estimate,
      travel_duration = travel_duration_estimate,
      trip_type = trip_type_estimate
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.dropColumn("days_off_travel_status_estimate")
    table.dropColumn("days_off_travel_status_actual")

    table.dropColumn("date_back_to_work_estimate")
    table.dropColumn("date_back_to_work_actual")

    table.dropColumn("travel_duration_estimate")
    table.dropColumn("travel_duration_actual")

    table.dropColumn("trip_type_estimate")
    table.dropColumn("trip_type_actual")
  })
}
