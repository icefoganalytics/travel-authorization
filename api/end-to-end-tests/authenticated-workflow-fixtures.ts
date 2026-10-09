import { readFileSync } from "node:fs"
import path from "node:path"

import db from "@/db/db-client"

export type AuthenticatedWorkflowAccount = {
  email: string
  auth0Subject: string
}

export type AuthenticatedWorkflowAccounts = {
  traveller: AuthenticatedWorkflowAccount
  supervisor: AuthenticatedWorkflowAccount
  travelDesk: AuthenticatedWorkflowAccount
  finance: AuthenticatedWorkflowAccount
}

export function loadAuthenticatedWorkflowAccounts(): AuthenticatedWorkflowAccounts {
  const accountsPath = path.join(__dirname, "tests", ".auth", "accounts.json")
  return JSON.parse(readFileSync(accountsPath, "utf8")) as AuthenticatedWorkflowAccounts
}

async function createUser(account: AuthenticatedWorkflowAccount, roles: string): Promise<void> {
  await db.query(
    `
      INSERT INTO users (sub, email, status, first_name, last_name, department, roles)
      VALUES ($1, $2, 'active', 'End-to-End', 'Test User', 'E2E TEST DEPARTMENT', $3)
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

export async function seedAuthenticatedWorkflowData({
  traveller,
  supervisor,
  travelDesk,
  finance,
}: AuthenticatedWorkflowAccounts): Promise<void> {
  await seedAutomaticEstimateReferenceData()
  await db.query("INSERT INTO travel_purposes (purpose) VALUES ($1)", {
    bind: ["Conference"],
  })
  await db.query("INSERT INTO locations (city, province) VALUES ($1, $2), ($3, $4)", {
    bind: ["Whitehorse", "YT", "Vancouver", "BC"],
  })
  await createUser(traveller, "user")
  await createUser(supervisor, "user")
  await createUser(travelDesk, "travel_desk_user")
  await createUser(finance, "finance_user")
}
