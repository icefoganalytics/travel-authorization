import { Factory } from "fishery"
import { nth } from "lodash"

import {
  type TravelDeskRentalCar,
  TravelDeskRentalCarLocationTypes,
} from "@/api/travel-desk-rental-cars-api"

export const travelDeskRentalCarFactory = Factory.define<TravelDeskRentalCar>(({ sequence }) => {
  const timestamp = "2026-11-01T00:00:00.000Z"
  const cities = ["Whitehorse (YT)", "Vancouver (BC)", "Toronto (ON)", "Dawson (YT)"]
  const locationTypes = Object.values(TravelDeskRentalCarLocationTypes)
  const pickUpCity = nth(cities, (sequence - 1) % cities.length)!
  const pickUpLocation = nth(locationTypes, (sequence - 1) % locationTypes.length)!
  const pickUpLocationOther =
    pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER ? `Rental office ${sequence}` : null

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
