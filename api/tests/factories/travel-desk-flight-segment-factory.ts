import { Factory } from "fishery"

import { TravelDeskFlightSegment } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskFlightOptionFactory from "@/factories/travel-desk-flight-option-factory"

export const travelDeskFlightSegmentFactory = Factory.define<TravelDeskFlightSegment>(
  ({ associations, onCreate, sequence }) => {
    onCreate(async (travelDeskFlightSegment) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskFlightSegment)
        return travelDeskFlightSegment
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskFlightSegment with attributes: ${JSON.stringify(
            travelDeskFlightSegment.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const flightOption =
      associations.flightOption ?? travelDeskFlightOptionFactory.build({ id: undefined })

    const travelDeskFlightSegment = TravelDeskFlightSegment.build({
      flightOptionId: flightOption.id,
      flightNumber: `YT${sequence}`,
      departAt: new Date("2026-10-27T15:00:00.000Z"),
      departLocation: "Whitehorse",
      arriveAt: new Date("2026-10-27T18:00:00.000Z"),
      arriveLocation: "Vancouver",
      duration: "3 hours",
      status: "Confirmed",
      class: "Economy",
      sortOrder: 1,
    })

    travelDeskFlightSegment.flightOption = flightOption

    return travelDeskFlightSegment
  }
)

export default travelDeskFlightSegmentFactory
