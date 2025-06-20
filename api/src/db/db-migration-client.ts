import knex, { type Knex } from "knex"
import { cloneDeep, merge } from "lodash"

import { DB_CONFIG, NODE_ENV } from "@/config"

export function buildKnexConfig(options?: Knex.Config): Knex.Config {
  return merge(cloneDeep(DB_CONFIG), options)
}

export const db = knex(buildKnexConfig())

// TODO: double check this is something we want in production.
db.on("query", (query) => {
  if (NODE_ENV === "production") {
    console.log(`Executing: ${query.sql}`)
  } else if (NODE_ENV === "test") {
    // don't log anything
  } else {
    console.log(`Executing (default): ${query.sql} ${JSON.stringify(query.bindings)}`)
  }
})

export default db
