import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelDeskHotel } from "@/models"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskHotelFactory = FactoryShark.define(TravelDeskHotel, ({ associate }) => {
  associate("travelRequest", travelDeskTravelRequestFactory)

  const checkIn = faker.date.future()

  return {
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
  }
})

export default travelDeskHotelFactory
