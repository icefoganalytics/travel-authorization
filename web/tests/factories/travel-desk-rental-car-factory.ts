import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import {
  type TravelDeskRentalCar,
  TravelDeskRentalCarLocationTypes,
} from "@/api/travel-desk-rental-cars-api"

const CITIES = ["Whitehorse (YT)", "Vancouver (BC)", "Toronto (ON)", "Dawson (YT)"]
const LOCATION_TYPES = Object.values(TravelDeskRentalCarLocationTypes)

export const travelDeskRentalCarFactory = Factory.define<TravelDeskRentalCar>(({ sequence }) => {
  const timestamp = "2026-11-01T00:00:00.000Z"
  const pickUpCity = faker.helpers.arrayElement(CITIES)
  const pickUpLocation = faker.helpers.arrayElement(LOCATION_TYPES)

  let pickUpLocationOther: string | null = null
  if (pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER) {
    pickUpLocationOther = `Rental office ${sequence}`
  }

  return {
    id: sequence,
    travelRequestId: 1,
    pickUpCity,
    pickUpLocation,
    pickUpLocationOther,
    dropOffCity: null,
    dropOffLocation: null,
    dropOffLocationOther: null,
    sameDropOffLocation: true,
    matchFlightTimes: false,
    vehicleTypeChangeIndicator: null,
    vehicleType: "Compact",
    vehicleChangeRationale: null,
    pickUpDate: "2026-12-01T09:15:00.000Z",
    dropOffDate: "2026-12-05T18:45:00.000Z",
    additionalNotes: null,
    status: "Requested",
    reservedVehicleInfo: null,
    booking: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
})

export default travelDeskRentalCarFactory
