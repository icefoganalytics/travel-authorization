import { faker } from "@faker-js/faker"
import FactoryShark from "factory-shark"

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
    const segmentNumber = faker.number.int({
      min: 0,
      max: 100,
    })
    let modeOfTransportOther = null
    if (modeOfTransport === TravelSegment.TravelMethods.OTHER) {
      modeOfTransportOther = faker.hacker.ingverb()
    }

    return {
      segmentNumber,
      modeOfTransport,
      modeOfTransportOther,
      isActual: false,
    }
  }
)

export default travelSegmentFactory
