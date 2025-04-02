import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.integer("creator_id")

    table.foreign("creator_id").references("users.id").onDelete("RESTRICT")
  })

  let systemUser = await knex("users")
    .select(["id"])
    .where("email", "system.user@travel-auth.com")
    .first()
  if (!systemUser) {
    ;[systemUser] = await knex("users")
      .insert({
        email: "system.user@travel-auth.com",
        sub: "NO_LOGIN_system.user@travel-auth.com",
        first_name: "System",
        last_name: "User",
        department: "System Users",
        roles: ["admin"],
        status: "active",
      })
      .returning(["id"])
  }

  await knex("travel_authorization_pre_approvals")
    .where({
      creator_id: null,
    })
    .update({
      creator_id: systemUser.id,
    })

  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.integer("creator_id").notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approvals", (table) => {
    table.dropColumn("creator_id")
  })
}
