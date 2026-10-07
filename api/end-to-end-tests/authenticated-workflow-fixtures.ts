import db from "@/db/db-client"

export type AuthenticatedWorkflowAccounts = {
  traveller: {
    email: string
    auth0Subject: string
  }
  supervisor: {
    email: string
    auth0Subject: string
  }
  admin: {
    email: string
    auth0Subject: string
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
      auth0Subject: requiredEnvironmentVariable("TRAVELLER_AUTH0_SUBJECT"),
    },
    supervisor: {
      email: requiredEnvironmentVariable("SUPERVISOR_EMAIL"),
      auth0Subject: requiredEnvironmentVariable("SUPERVISOR_AUTH0_SUBJECT"),
    },
    admin: {
      email: requiredEnvironmentVariable("ADMIN_EMAIL"),
      auth0Subject: requiredEnvironmentVariable("ADMIN_AUTH0_SUBJECT"),
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
    { bind: [account.auth0Subject, account.email.toLowerCase(), roles] }
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
