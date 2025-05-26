import { Factory } from "fishery"
import { faker } from "@faker-js/faker"
import { Includeable } from "sequelize"

import { TravelSegment } from "@/models"
import { locationFactory, travelAuthorizationFactory } from "@/factories"
import { presence, nestedSaveAndAssociateIfNew } from "@/factories/helpers"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const travelSegmentFactory = Factory.define<TravelSegment, TransientParam>(
  ({ associations, params, onCreate, transientParams }) => {
    onCreate(async (travelSegment) => {
      try {
        await nestedSaveAndAssociateIfNew(travelSegment)

        if (transientParams.include === undefined) {
          return travelSegment
        }

        return travelSegment.reload({
          include: transientParams.include,
        })
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelSegment with attributes: ${JSON.stringify(
            travelSegment.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const modeOfTransport = presence(
      params.modeOfTransport,
      faker.helpers.enumValue(TravelSegment.TravelMethods)
    )

    const travelSegment = TravelSegment.build({
      segmentNumber: faker.number.int({ min: 0, max: 100 }),
      modeOfTransport,
      modeOfTransportOther:
        modeOfTransport === TravelSegment.TravelMethods.OTHER ? faker.hacker.ingverb() : null,
      isActual: false,
    })

    travelSegment.travelAuthorization =
      associations.travelAuthorization ?? travelAuthorizationFactory.build()
    travelSegment.departureLocation = associations.departureLocation ?? locationFactory.build()
    travelSegment.arrivalLocation = associations.arrivalLocation ?? locationFactory.build()

    return travelSegment
  }
)

export default travelSegmentFactory
