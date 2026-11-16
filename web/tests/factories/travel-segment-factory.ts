import { faker } from "@faker-js/faker"
import { Factory } from "fishery"

import { type TravelSegment, TravelSegmentTravelMethods } from "@/api/travel-segments-api"

export const travelSegmentFactory = Factory.define<TravelSegment>(({ sequence }) => {
  const createdAt = faker.date.past().toISOString()

  return {
    id: sequence,
    travelAuthorizationId: sequence,
    departureLocationId: null,
    arrivalLocationId: null,
    segmentNumber: sequence,
    departureOn: null,
    departureTime: null,
    modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
    modeOfTransportOther: null,
    accommodationType: null,
    accommodationTypeOther: null,
    isActual: false,
    createdAt,
    updatedAt: createdAt,
  }
})

export default travelSegmentFactory
