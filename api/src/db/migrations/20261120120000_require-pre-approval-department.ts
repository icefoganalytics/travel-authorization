import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  const missingDepartment = await knex("travel_authorization_pre_approvals")
    .select("id")
    .whereNull("department")
    .orWhereRaw("department !~ '[^[:space:]]'")
    .first()

  if (missingDepartment) {
    throw new Error(
      `Resolve the missing department on pre-approval ${missingDepartment.id} before migrating. ` +
        "Department controls access and cannot be inferred safely."
    )
  }

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropNullable("department")
    table.check("department ~ '[^[:space:]]'", [], "pre_approval_department_not_blank")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropChecks("pre_approval_department_not_blank")
    table.setNullable("department")
  })
}
