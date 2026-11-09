import { Sequelize, type Options } from "@sequelize/core"
import { MsSqlDialect } from "@sequelize/mssql"

import {
  NODE_ENV,
  TRAVELPORT_DB_HOST,
  TRAVELPORT_DB_NAME,
  TRAVELPORT_DB_PASS,
  TRAVELPORT_DB_PORT,
  TRAVELPORT_DB_TRUST_SERVER_CERTIFICATE_ENABLED,
  TRAVELPORT_DB_USER,
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
  define: {
    timestamps: false,
    paranoid: false,
  },
}

export const db = new Sequelize(SEQUELIZE_CONFIG)

export default db
