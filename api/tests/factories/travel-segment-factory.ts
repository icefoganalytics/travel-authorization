import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"
import { Includeable } from "@sequelize/core"

import { TravelSegment } from "@/models"
import { locationFactory, travelAuthorizationFactory } from "@/factories"
import { presence } from "@/factories/helpers"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const travelSegmentFactory = FactoryShark.define<TravelSegment, TransientParam>(
  TravelSegment,
  ({ associate, params, afterCreate, transient }) => {
    associate("travelAuthorization", travelAuthorizationFactory)
    associate("departureLocation", locationFactory)
    associate("arrivalLocation", locationFactory)

    afterCreate(async (travelSegment) => {
      if (transient.include !== undefined) {
        await travelSegment.reload({ include: transient.include })
      }
    })

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
    }
  }
)

export default travelSegmentFactory
