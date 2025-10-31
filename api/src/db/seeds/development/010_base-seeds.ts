import { Knex } from "knex"
import { isNil } from "lodash"

import { TravelPurpose } from "@/models"

export async function seed(knex: Knex): Promise<void> {
  const travelPurposesAttributes = [
    {
      purpose: "Maintenance",
    },
    {
      purpose: "Conference",
    },
    {
      purpose: "Workshop",
    },
    {
      purpose: "General Travel",
    },
    {
      purpose: "Community Travel",
    },
    {
      purpose: "IT",
    },
  ]
  for (const travelPurposeAttributes of travelPurposesAttributes) {
    const travelPurpose = await TravelPurpose.findOne({
      where: {
        purpose: travelPurposeAttributes.purpose,
      },
    })
    if (isNil(travelPurpose)) {
      await TravelPurpose.create(travelPurposeAttributes)
    } else {
      await travelPurpose.update(travelPurposeAttributes)
    }
  }

  const transportMethodsAttributes = [
    {
      method: "Rental vehicle",
    },
    {
      method: "Personal vehicle",
    },
    {
      method: "Fleet vehicle",
    },
    {
      method: "Plane",
    },
  ]

  for (const transportMethodAttributes of transportMethodsAttributes) {
    const transportMethod = await knex("transportMethod")
      .where({ method: transportMethodAttributes.method })
      .first()

    if (isNil(transportMethod)) {
      await knex("transportMethod").insert(transportMethodAttributes)
    } else {
      await knex("transportMethod")
        .where({ method: transportMethodAttributes.method })
        .update(transportMethodAttributes)
    }
  }
}
