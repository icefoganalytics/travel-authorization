import { Sequelize, Options } from "sequelize"

import {
  TRAVCOM_DB_NAME,
  TRAVCOM_DB_USER,
  TRAVCOM_DB_PASS,
  TRAVCOM_DB_HOST,
  TRAVCOM_DB_PORT,
  NODE_ENV,
} from "@/config"
import { compactSql } from "@/integrations/trav-com-integration/utils/compact-sql"

export * as MssqlTypeExtensions from "@/integrations/trav-com-integration/db/mssql-type-extensions"

// NOTE: you cannot use multiple transaction managers for the same Sequelize instance until Sequelize 7
// So the following code should not be used, as it will break transactions everywhere.
// export const transactionManager = createNamespace("transaction-manager-trav-com")
// Sequelize.useCLS(transactionManager)

if (TRAVCOM_DB_NAME === undefined) throw new Error("database name is unset.")
if (TRAVCOM_DB_USER === undefined) throw new Error("database username is unset.")
if (TRAVCOM_DB_PASS === undefined) throw new Error("database password is unset.")
if (TRAVCOM_DB_HOST === undefined) throw new Error("database host is unset.")
if (TRAVCOM_DB_PORT === undefined) throw new Error("database port is unset.")

function sqlLogger(query: string) {
  console.log(compactSql(query))
}

export const SEQUELIZE_CONFIG: Options = {
  username: TRAVCOM_DB_USER,
  password: TRAVCOM_DB_PASS,
  database: TRAVCOM_DB_NAME,
  dialect: "mssql",
  host: TRAVCOM_DB_HOST,
  port: TRAVCOM_DB_PORT,
  schema: "dbo",
  logging: NODE_ENV === "development" ? sqlLogger : false,
  // Non-standard tables must now declare their customizations
  // If possible, standardize new tables, rather than customizing them.
  define: {
    underscored: true,
    timestamps: true, // This is actually the default, but making it explicit for clarity.
    paranoid: true,
    whereMergeStrategy: "and", // where fields will be merged using the and operator (instead of overwriting each other)
  },
}

export const db = new Sequelize(SEQUELIZE_CONFIG)

export default db
