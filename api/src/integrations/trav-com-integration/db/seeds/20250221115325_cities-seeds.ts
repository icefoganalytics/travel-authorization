import fs from "fs"
import { isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import dbMigrationClient from "@/integrations/trav-com-integration/db/db-migration-client"
import { type CityRaw } from "@/integrations/trav-com-integration/models"

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/cities.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: citiesAttributes } = Papa.parse<CityRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const cityAttributes of citiesAttributes) {
    const existingCity = await dbMigrationClient<CityRaw>("Cities")
      .where({
        CityCode: cityAttributes.CityCode,
        CityName: cityAttributes.CityName,
        Country: cityAttributes.Country,
      })
      .first()

    if (isNil(existingCity)) {
      await dbMigrationClient<CityRaw>("Cities").insert(cityAttributes)
    } else {
      await dbMigrationClient<CityRaw>("Cities")
        .where({
          CityCode: cityAttributes.CityCode,
        })
        .update(cityAttributes)
    }
  }
}
