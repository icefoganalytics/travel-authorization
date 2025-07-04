import { Sequelize, Options } from "@sequelize/core"
import { MsSqlDialect } from "@sequelize/mssql"

import {
  TRAVCOM_DB_NAME,
  TRAVCOM_DB_USER,
  TRAVCOM_DB_PASS,
  TRAVCOM_DB_HOST,
  TRAVCOM_DB_PORT,
  TRAVCOM_DB_TRUST_SERVER_CERTIFICATE_ENABLED,
  NODE_ENV,
} from "@/config"
import { compactSql } from "@/integrations/trav-com-integration/utils/compact-sql"

export * as MssqlTypeExtensions from "@/integrations/trav-com-integration/db/mssql-type-extensions"

if (TRAVCOM_DB_NAME === undefined) throw new Error("database name is unset.")
if (TRAVCOM_DB_USER === undefined) throw new Error("database username is unset.")
if (TRAVCOM_DB_PASS === undefined) throw new Error("database password is unset.")
if (TRAVCOM_DB_HOST === undefined) throw new Error("database host is unset.")
if (TRAVCOM_DB_PORT === undefined) throw new Error("database port is unset.")

function sqlLogger(query: string) {
  console.log(compactSql(query))
}

export const SEQUELIZE_CONFIG: Options<MsSqlDialect> = {
  dialect: MsSqlDialect,
  server: TRAVCOM_DB_HOST,
  port: TRAVCOM_DB_PORT,
  database: TRAVCOM_DB_NAME,
  encrypt: true,
  authentication: {
    type: "default",
    options: {
      userName: TRAVCOM_DB_USER,
      password: TRAVCOM_DB_PASS,
    },
  },
  trustServerCertificate: TRAVCOM_DB_TRUST_SERVER_CERTIFICATE_ENABLED,
  schema: "dbo",
  logging: NODE_ENV === "development" ? sqlLogger : false,
  // Non-standard tables must now declare their customizations
  // If possible, standardize new tables, rather than customizing them.
  define: {
    underscored: true,
    timestamps: true, // This is actually the default, but making it explicit for clarity.
    paranoid: true,
  },
}

export const db = new Sequelize(SEQUELIZE_CONFIG)

export default db
