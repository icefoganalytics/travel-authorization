import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_travel_agencies", async (table) => {
    table.increments("id").primary()
    table.string("agency_name").notNullable()
    table.text("agency_info")
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      travel_desk_travel_agencies (id, agency_name, agency_info)
    SELECT
      "agencyID" as id,
      "agencyName" as agency_name,
      "agencyInfo" as agency_info
    FROM
      "travelDeskTravelAgent"
  `)

  await knex.schema.alterTable("travel_desk_travel_requests", async (table) => {
    table.integer("travel_agency_id").unsigned()
    table
      .foreign("travel_agency_id")
      .references("travel_desk_travel_agencies.id")
      .onDelete("RESTRICT")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_desk_travel_requests
    SET
      travel_agency_id = travel_desk_travel_agent_id
  `)

  await knex.schema.alterTable("travel_desk_travel_requests", async (table) => {
    table.dropColumn("travel_desk_travel_agent_id")
  })

  await knex.schema.dropTable("travelDeskTravelAgent")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("travelDeskTravelAgent", async (table) => {
    table.increments("agencyID").primary()
    table.string("agencyName").notNullable()
    table.string("agencyInfo")
  })

  console.warn("Destructively trims agency_info to 255 characters.")
  await knex.raw(/* sql */ `
    INSERT INTO
      "travelDeskTravelAgent" ("agencyID", "agencyName", "agencyInfo")
    SELECT
      id as "agencyID",
      agency_name as "agencyName",
      LEFT(agency_info, 255) as "agencyInfo"
    FROM
      travel_desk_travel_agencies
  `)

  await knex.schema.alterTable("travel_desk_travel_requests", async (table) => {
    table.integer("travel_desk_travel_agent_id").unsigned()
    table
      .foreign("travel_desk_travel_agent_id")
      .references("travelDeskTravelAgent.agencyID")
      .onDelete("CASCADE")
  })

  await knex.raw(/* sql */ `
    UPDATE travel_desk_travel_requests
    SET
      travel_desk_travel_agent_id = travel_agency_id
  `)

  await knex.schema.alterTable("travel_desk_travel_requests", async (table) => {
    table.dropColumn("travel_agency_id")
  })

  await knex.schema.dropTable("travel_desk_travel_agencies")
}
