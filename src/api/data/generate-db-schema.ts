import fs from "fs"
import { sqldb as knex } from "./index"

function mapPostgresTypeToKnex(type: string) {
  switch (type) {
    case "integer":
      return "integer"
    case "text":
      return "text"
    case "timestamp without time zone":
      return "timestamp"
    // Add other mappings as needed
    default:
      return "text" // Default to text for simplicity, adjust as needed
  }
}

const migrationTemplate = `
import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
UP_BODY
}

exports.down = function (knex: knex.Knex, Promise: any) {
  // TODO
};
`.replace(/^\n/, "")

function increaseIndent(text: string, indent = 2) {
  return text
    .split("\n")
    .map((line) => " ".repeat(indent) + line)
    .join("\n")
}

async function fetchPrimaryKeyColumnForTable(tableName: string) {
  const primaryKeyInfo = await knex.raw(
    `SELECT a.attname as column_name
     FROM   pg_index i
     JOIN   pg_attribute a ON a.attrelid = i.indrelid
                          AND a.attnum = ANY(i.indkey)
     WHERE  i.indrelid = ?::regclass
     AND    i.indisprimary;`,
    [`"${tableName}"`]
  )
  const primaryKeyColumn = primaryKeyInfo.rows[0]?.column_name
  return primaryKeyColumn
}

export async function generateDbSchema(): Promise<string> {
  const tables = await knex.raw(`SELECT tablename FROM pg_tables WHERE schemaname='public'`)
  let knexStatements = ""
  for (const table of tables.rows) {
    const tableName = table.tablename
    const columns = await knex.raw(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ?`,
      [tableName]
    )
    const primaryKeyColumn = await fetchPrimaryKeyColumnForTable(tableName)

    knexStatements += `knex.schema.createTable('${tableName}', (table) => {\n`

    for (const column of columns.rows) {
      const knexMethod = mapPostgresTypeToKnex(column.data_type)
      knexStatements += `  table.${knexMethod}('${column.column_name}')`

      if (column.is_nullable === "NO") {
        knexStatements += `.notNullable()`
      }
      if (column.column_name === primaryKeyColumn) {
        knexStatements += `.primary()`
      }
      knexStatements += `\n`
    }

    knexStatements += `});\n\n`
  }

  const indentedKnexStatements = increaseIndent(knexStatements, 2)
  const migration = migrationTemplate.replace("UP_BODY", indentedKnexStatements)

  fs.writeFileSync("./data/schema.ts", migration)
  return knexStatements
}
