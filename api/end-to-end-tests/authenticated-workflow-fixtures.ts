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

async function seedAutomaticEstimateReferenceData(): Promise<void> {
  await db.query(`
    INSERT INTO travel_allowances (allowance_type, amount, currency)
    VALUES
      ('maxium_aircraft_allowance', 1000, 'CAD'),
      ('aircraft_allowance_per_segment', 350, 'CAD'),
      ('distance_allowance_per_kilometer', 0.605, 'CAD'),
      ('hotel_allowance_per_night', 250, 'CAD')
  `)
  await db.query(`
    INSERT INTO per_diems (travel_region, claim_type, amount, currency)
    VALUES
      ('Canada', 'breakfast', 21.9, 'CAD'),
      ('Canada', 'lunch', 22.15, 'CAD'),
      ('Canada', 'dinner', 54.4, 'CAD'),
      ('Canada', 'incidentals', 17.3, 'CAD'),
      ('Canada', 'private_accommodations', 50, 'CAD')
  `)
}

export async function seedBookedTravelDeskRequest(travelAuthorizationId: string): Promise<void> {
  await db.query(
    `
      UPDATE travel_desk_travel_requests
      SET status = $1
      WHERE travel_authorization_id = $2
    `,
    {
      bind: ["booked", travelAuthorizationId],
    }
  )
  await db.query(
    `
      UPDATE travel_authorizations
      SET wizard_step_name = $1
      WHERE id = $2
    `,
    {
      bind: ["awaiting-travel-start", travelAuthorizationId],
    }
  )
}

export async function seedAuthenticatedWorkflowData({
  traveller,
  supervisor,
  admin,
}: AuthenticatedWorkflowAccounts): Promise<void> {
  await seedAutomaticEstimateReferenceData()
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
