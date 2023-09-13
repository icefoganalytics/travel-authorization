import fs from "fs"
import { sqldb as knex } from "./index"

function mapPostgresTypeToColumnCreationMethod(
  type: string,
  columnName: string,
  isPrimary: boolean
) {
  switch (type) {
    case "boolean":
      return `boolean('${columnName}')`
    case "bytea":
      return `binary('${columnName}')`
    case "date":
      return `date('${columnName}')`
    case "integer":
      if (isPrimary) {
        return `increments('${columnName}')`
      } else {
        return `integer('${columnName}')`
      }
    case "real":
      return `float('${columnName}')`
    case "text":
      return `text('${columnName}')`
    case "timestamp without time zone":
      return `timestamp('${columnName}')`
    case "timestamp with time zone":
      return `datetime('${columnName}')`
    case "time without time zone":
      return `time('${columnName}')`
    case "character varying":
      return `string('${columnName}')`
    default:
      console.warn("Unknown type: ", type)
      return "text" // Default to text for simplicity, adjust as needed
  }
}

const migrationTemplate = `
import * as knex from "knex";

// Last updated: ${new Date().toISOString()}
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

function createColumnStatement({
  dataType,
  columnName,
  isNullable,
  isPrimary,
}: {
  dataType: string
  columnName: string
  isNullable: boolean
  isPrimary: boolean
}) {
  const columnCreationMethod = mapPostgresTypeToColumnCreationMethod(
    dataType,
    columnName,
    isPrimary
  )
  const columnStatements = [columnCreationMethod]

  if (isNullable) {
    columnStatements.push(".notNullable()")
  }
  if (isPrimary) {
    columnStatements.push(".primary()")
  }

  return columnStatements.join("")
}

async function createTableStatement({ tableName }: { tableName: string }) {
  const columns = await knex.raw(
    `SELECT
        column_name AS "columnName"
        , data_type AS "dataType"
        , is_nullable AS "isNullable"
      FROM
        information_schema.columns
      WHERE
        table_name = ?
      `,
    [tableName]
  )
  const primaryKeyColumn = await fetchPrimaryKeyColumnForTable(tableName)
  const tableStatements = [`knex.schema.createTable('${tableName}', (t) => {`]

  for (const column of columns.rows) {
    const columnStatement = createColumnStatement({
      dataType: column.dataType,
      columnName: column.columnName,
      isNullable: column.isNullable === "NO",
      isPrimary: column.columnName === primaryKeyColumn,
    })
    tableStatements.push(`  t.${columnStatement}`)
  }

  tableStatements.push(`});`)

  return tableStatements.join("\n")
}

export async function generateDbSchema(): Promise<string> {
  const tables = await knex.raw(`SELECT tablename FROM pg_tables WHERE schemaname='public'`)
  const schemaStatements = []
  for (const table of tables.rows) {
    const tableStatement = await createTableStatement({ tableName: table.tablename })
    schemaStatements.push(tableStatement)
  }

  const schemaString = schemaStatements.join("\n\n")
  const indentedSchemaString = increaseIndent(schemaString, 2)
  const migration = migrationTemplate.replace("UP_BODY", indentedSchemaString)

  fs.writeFileSync("./data/schema.ts", migration)
  return migration
}
