import { Factory } from "fishery"

import {
  type TravelSegment,
  TravelSegmentAccommodationTypes,
  TravelSegmentTravelMethods,
} from "@/api/travel-segments-api"

export const travelSegmentFactory = Factory.define<TravelSegment>(({ sequence }) => ({
  id: sequence,
  travelAuthorizationId: 5,
  departureLocationId: null,
  arrivalLocationId: null,
  segmentNumber: sequence,
  departureOn: "2026-11-12",
  departureTime: null,
  modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
  modeOfTransportOther: null,
  accommodationType: TravelSegmentAccommodationTypes.HOTEL,
  accommodationTypeOther: null,
  isActual: false,
  isPrimaryDestination: false,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
}))

export default travelSegmentFactory
