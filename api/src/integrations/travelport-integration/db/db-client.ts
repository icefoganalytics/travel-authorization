import { Sequelize, Options } from "@sequelize/core"
import { MsSqlDialect } from "@sequelize/mssql"

import {
  TRAVELPORT_DB_NAME,
  TRAVELPORT_DB_USER,
  TRAVELPORT_DB_PASS,
  TRAVELPORT_DB_HOST,
  TRAVELPORT_DB_PORT,
  TRAVELPORT_DB_TRUST_SERVER_CERTIFICATE_ENABLED,
  NODE_ENV,
} from "@/config"

export const SEQUELIZE_CONFIG: Options<MsSqlDialect> = {
  dialect: MsSqlDialect,
  server: TRAVELPORT_DB_HOST,
  port: TRAVELPORT_DB_PORT,
  database: TRAVELPORT_DB_NAME,
  encrypt: true,
  authentication: {
    type: "default",
    options: {
      userName: TRAVELPORT_DB_USER,
      password: TRAVELPORT_DB_PASS,
    },
  },
  trustServerCertificate: TRAVELPORT_DB_TRUST_SERVER_CERTIFICATE_ENABLED,
  schema: "dbo",
  logging: NODE_ENV === "development" ? console.log : false,
  define: { timestamps: false, paranoid: false },
}

let database: Sequelize<MsSqlDialect> | undefined

export function getDatabase(): Sequelize<MsSqlDialect> {
  if (database !== undefined) return database

  if (TRAVELPORT_DB_NAME === "") throw new Error("database name is unset.")
  if (TRAVELPORT_DB_USER === "") throw new Error("database username is unset.")
  if (TRAVELPORT_DB_PASS === "") throw new Error("database password is unset.")
  if (TRAVELPORT_DB_HOST === "") throw new Error("database host is unset.")

  database = new Sequelize(SEQUELIZE_CONFIG)
  return database
}
