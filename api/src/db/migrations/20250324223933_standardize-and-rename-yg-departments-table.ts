import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("yg_employee_groups", (table) => {
    table.increments("id").primary()
    table.string("department").notNullable()
    table.string("division")
    table.string("branch")
    table.string("unit")
    table.integer("order").notNullable().defaultTo(100)

    table.timestamp("last_sync_success_at")
    table.timestamp("last_sync_failure_at")

    table.timestamps(true, true)
    table.timestamp("deleted_at").nullable()

    table.unique(["department", "division", "branch", "unit"], {
      indexName: "yg_employee_groups_department_division_branch_unit_unique",
      predicate: knex
        .whereNotNull("department")
        .whereNotNull("division")
        .whereNotNull("branch")
        .whereNotNull("unit")
        .whereNull("deleted_at"),
    })
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      yg_employee_groups (
        department,
        division,
        branch,
        unit,
        "order",
        last_sync_success_at,
        last_sync_failure_at
      )
    SELECT DISTINCT
      ON (department, division, branch, unit) department,
      division,
      branch,
      unit,
      "order",
      update_date as last_sync_success_at,
      NULL as last_sync_failure_at
    FROM
      "YgDepartments"
    WHERE
      department IS NOT NULL
      AND division IS NOT NULL
      AND branch IS NOT NULL
      AND unit IS NOT NULL
    ORDER BY
      department,
      division,
      branch,
      unit,
      "order"
  `)

  await knex.schema.dropTable("YgDepartments")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("YgDepartments", (table) => {
    table.increments("id").primary()
    table.timestamp("update_date").notNullable()
    table.string("department")
    table.string("division")
    table.string("branch")
    table.string("unit")
    table.integer("order")
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      "YgDepartments" (
        update_date,
        department,
        division,
        branch,
        unit,
        "order"
      )
    SELECT
      COALESCE(last_sync_success_at, created_at) as update_date,
      department,
      division,
      branch,
      unit,
      "order"
    FROM
      yg_employee_groups
    WHERE
      deleted_at IS NULL
  `)

  await knex.schema.dropTable("yg_employee_groups")
}
