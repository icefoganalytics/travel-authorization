import knex, { Knex } from "knex"
import { cloneDeep, merge } from "lodash"

import { TRAVELPORT_DB_CONFIG, NODE_ENV } from "@/config"

export function buildKnexConfig(options?: Knex.Config): Knex.Config {
  return merge(cloneDeep(TRAVELPORT_DB_CONFIG), options)
}

export const db = knex(buildKnexConfig())

db.on("query", (query) => {
  if (NODE_ENV !== "test") console.log(`Executing (Travelport): ${query.sql}`)
})

export default db
