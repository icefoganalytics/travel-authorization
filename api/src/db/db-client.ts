import { Sequelize, Options } from "@sequelize/core"
import { PostgresDialect } from "@sequelize/postgres"
import minify from "pg-minify"

import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER, NODE_ENV } from "@/config"

if (DB_NAME === undefined) throw new Error("database name is unset.")
if (DB_USER === undefined) throw new Error("database username is unset.")
if (DB_PASS === undefined) throw new Error("database password is unset.")
if (DB_HOST === undefined) throw new Error("database host is unset.")
if (DB_PORT === undefined) throw new Error("database port is unset.")

function sqlLogger(query: string) {
  console.log(minify(query))
}

export const SEQUELIZE_CONFIG: Options<PostgresDialect> = {
  dialect: PostgresDialect,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: DB_PORT,
  ssl: false,
  clientMinMessages: "notice",
  schema: "public",
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
