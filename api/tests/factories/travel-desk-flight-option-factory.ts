import { Factory } from "fishery"

import { TravelDeskFlightOption } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskFlightRequestFactory from "@/factories/travel-desk-flight-request-factory"
import userFactory from "@/factories/user-factory"

export const travelDeskFlightOptionFactory = Factory.define<TravelDeskFlightOption>(
  ({ associations, onCreate }) => {
    onCreate(async (travelDeskFlightOption) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskFlightOption)
        return travelDeskFlightOption
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskFlightOption with attributes: ${JSON.stringify(
            travelDeskFlightOption.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const flightRequest =
      associations.flightRequest ?? travelDeskFlightRequestFactory.build({ id: undefined })
    const traveler = associations.traveler ?? userFactory.build({ id: undefined })

    const travelDeskFlightOption = TravelDeskFlightOption.build({
      flightRequestId: flightRequest.id,
      travelerId: traveler.id,
      cost: "700.00",
      leg: "Whitehorse -> Vancouver",
      duration: "2 hours",
      flightPreferenceOrder: 1,
      additionalInformation: null,
    })

    travelDeskFlightOption.flightRequest = flightRequest
    travelDeskFlightOption.traveler = traveler
    travelDeskFlightOption.flightSegments = associations.flightSegments ?? []

    return travelDeskFlightOption
  }
)

export default travelDeskFlightOptionFactory
