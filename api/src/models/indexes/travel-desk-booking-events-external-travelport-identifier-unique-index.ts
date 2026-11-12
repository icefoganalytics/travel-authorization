import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const TravelDeskBookingEventsExternalTravelportIdentifierUniqueIndex = createIndexDecorator(
  "travel-desk-booking-events-external-travelport-identifier-unique",
  {
    name: "travel_desk_booking_events_active_external_identifier_unique",
    unique: true,
    where: {
      deletedAt: {
        [Op.is]: null,
      },
    },
    msg: "External Travelport identifier must be unique among active booking events.",
  }
)

export default TravelDeskBookingEventsExternalTravelportIdentifierUniqueIndex
