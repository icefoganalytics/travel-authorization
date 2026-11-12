import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelSegment } from "@/models"
import { locationFactory, travelAuthorizationFactory } from "@/factories"
import { presence } from "@/factories/helpers"

export const travelSegmentFactory = FactoryShark.define<TravelSegment>(
  TravelSegment,
  ({ associate, params }) => {
    associate("travelAuthorization", travelAuthorizationFactory)

    if (params.departureLocationId !== null) {
      associate("departureLocation", locationFactory)
    }

    if (params.arrivalLocationId !== null) {
      associate("arrivalLocation", locationFactory)
    }

    const modeOfTransport = presence(
      params.modeOfTransport,
      faker.helpers.enumValue(TravelSegment.TravelMethods)
    )

    return {
      segmentNumber: faker.number.int({ min: 0, max: 100 }),
      modeOfTransport,
      modeOfTransportOther:
        modeOfTransport === TravelSegment.TravelMethods.OTHER ? faker.hacker.ingverb() : null,
      isActual: false,
      isPrimaryDestination: false,
    }
  }
)

export default travelSegmentFactory
