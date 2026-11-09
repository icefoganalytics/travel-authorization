import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { TravelDeskHotel } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskHotelFactory = Factory.define<TravelDeskHotel>(
  ({ associations, onCreate }) => {
    onCreate(async (travelDeskHotel) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskHotel)
        return travelDeskHotel
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskHotel with attributes: ${JSON.stringify(
            travelDeskHotel.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelRequest =
      associations.travelRequest ?? travelDeskTravelRequestFactory.build({ id: undefined })
    const checkIn = faker.date.future()

    const travelDeskHotel = TravelDeskHotel.build({
      travelRequestId: travelRequest.id,
      city: faker.location.city(),
      isDedicatedConferenceHotelAvailable: false,
      conferenceName: null,
      conferenceHotelName: null,
      checkIn,
      checkOut: faker.date.soon({ refDate: checkIn }),
      additionalInformation: null,
      status: TravelDeskHotel.Statuses.REQUESTED,
      reservedHotelInfo: null,
      booking: null,
    })

    travelDeskHotel.travelRequest = travelRequest

    return travelDeskHotel
  }
)

export default travelDeskHotelFactory
