import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("yg_employees", (table) => {
    table.increments("id").notNullable().primary()
    table.string("email").notNullable().unique()
    table.string("username").notNullable()
    table.string("full_name").notNullable()
    table.string("first_name").notNullable()
    table.string("last_name").notNullable()
    table.string("department").notNullable()
    table.string("division")
    table.string("branch")
    table.string("unit")
    table.string("organization")
    table.string("title")
    table.string("suite")
    table.string("phone_office")
    table.string("fax_office")
    table.string("mobile")
    table.string("office")
    table.string("address")
    table.string("po_box")
    table.string("community")
    table.string("postal_code")
    table.string("latitude")
    table.string("longitude")
    table.string("mailcode")
    table.string("manager")

    table.timestamp("last_sync_success_at")
    table.timestamp("last_sync_failure_at")

    table.timestamps(true, true)
    table.timestamp("deleted_at").nullable()
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      yg_employees (
        email,
        username,
        full_name,
        first_name,
        last_name,
        department,
        division,
        branch,
        unit,
        organization,
        title,
        suite,
        phone_office,
        fax_office,
        mobile,
        office,
        "address",
        po_box,
        community,
        postal_code,
        latitude,
        longitude,
        mailcode,
        manager,
        last_sync_success_at,
        last_sync_failure_at
      )
    SELECT DISTINCT
      ON (email) email,
      username,
      full_name,
      first_name,
      last_name,
      department,
      division,
      branch,
      unit,
      organization,
      title,
      suite,
      phone_office,
      fax_office,
      mobile,
      office,
      "address",
      po_box,
      community,
      postal_code,
      latitude,
      longitude,
      mailcode,
      manager,
      update_date as last_sync_success_at,
      NULL as last_sync_failure_at
    FROM
      "YgEmployees"
    WHERE
      email IS NOT NULL
      AND username IS NOT NULL
      AND full_name IS NOT NULL
      AND first_name IS NOT NULL
      AND last_name IS NOT NULL
      AND department IS NOT NULL
    ORDER BY
      email,
      update_date ASC
  `)

  await knex.schema.dropTable("YgEmployees")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("YgEmployees", (table) => {
    table.increments("id").notNullable().primary()
    table.dateTime("update_date").notNullable()

    table.string("full_name")
    table.string("first_name")
    table.string("last_name")
    table.string("organization")
    table.string("department")
    table.string("division")
    table.string("branch")
    table.string("unit")
    table.string("title")
    table.string("email")
    table.string("suite")
    table.string("phone_office")
    table.string("fax_office")
    table.string("mobile")
    table.string("office")
    table.string("address")
    table.string("po_box")
    table.string("community")
    table.string("postal_code")
    table.string("latitude")
    table.string("longitude")
    table.string("mailcode")
    table.string("manager")
    table.string("username")
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      "YgEmployees" (
        update_date,
        full_name,
        first_name,
        last_name,
        organization,
        department,
        division,
        branch,
        unit,
        title,
        email,
        suite,
        phone_office,
        fax_office,
        mobile,
        office,
        "address",
        po_box,
        community,
        postal_code,
        latitude,
        longitude,
        mailcode,
        manager,
        username
      )
    SELECT
      last_sync_success_at as update_date,
      full_name,
      first_name,
      last_name,
      organization,
      department,
      division,
      branch,
      unit,
      title,
      email,
      suite,
      phone_office,
      fax_office,
      mobile,
      office,
      "address",
      po_box,
      community,
      postal_code,
      latitude,
      longitude,
      mailcode,
      manager,
      username
    FROM
      yg_employees
  `)

  await knex.schema.dropTable("yg_employees")
}
