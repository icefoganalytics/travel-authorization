import db from "@/db/db-client"

export type AuthenticatedWorkflowAccounts = {
  traveller: {
    email: string
    sub: string
  }
  supervisor: {
    email: string
    sub: string
  }
  admin: {
    email: string
    sub: string
  }
}

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be configured for authenticated end-to-end tests`)

  return value
}

export function authenticatedWorkflowAccountsFromEnvironment(): AuthenticatedWorkflowAccounts {
  return {
    traveller: {
      email: requiredEnvironmentVariable("TRAVELLER_EMAIL"),
      sub: requiredEnvironmentVariable("TRAVELLER_SUB"),
    },
    supervisor: {
      email: requiredEnvironmentVariable("SUPERVISOR_EMAIL"),
      sub: requiredEnvironmentVariable("SUPERVISOR_SUB"),
    },
    admin: {
      email: requiredEnvironmentVariable("ADMIN_EMAIL"),
      sub: requiredEnvironmentVariable("ADMIN_SUB"),
    },
  }
}

async function createUser(
  account: AuthenticatedWorkflowAccounts["traveller"],
  roles: string
): Promise<void> {
  await db.query(
    `
      INSERT INTO users (sub, email, status, first_name, last_name, roles)
      VALUES ($1, $2, 'active', 'End-to-End', 'Test User', $3)
    `,
    { bind: [account.sub, account.email.toLowerCase(), roles] }
  )
}

export async function seedAuthenticatedWorkflowData({
  traveller,
  supervisor,
  admin,
}: AuthenticatedWorkflowAccounts): Promise<void> {
  await db.query("INSERT INTO travel_purposes (purpose) VALUES ($1)", {
    bind: ["Conference"],
  })
  await db.query(
    "INSERT INTO locations (city, province) VALUES ($1, $2), ($3, $4)",
    { bind: ["Whitehorse", "YT", "Vancouver", "BC"] }
  )
  await createUser(traveller, "user")
  await createUser(supervisor, "user")
  await createUser(admin, "admin,finance_user")
}
