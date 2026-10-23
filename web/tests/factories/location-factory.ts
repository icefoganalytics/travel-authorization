import { Factory } from "fishery"

import { type LocationAsIndex } from "@/api/locations-api"

export const locationFactory = Factory.define<LocationAsIndex>(({ sequence }) => {
  const timestamp = "2026-01-01T00:00:00.000Z"

  return {
    id: sequence,
    city: `City ${sequence}`,
    province: "YT",
    createdAt: timestamp,
    updatedAt: timestamp,
  }
})

export default locationFactory
