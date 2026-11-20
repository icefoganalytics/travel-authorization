import { isEmpty, isNil } from "lodash"

import { TravelDeskBookingEvent } from "@/models"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

export class LoadAndValidateTravelDeskBookingEventForInvoiceService extends BaseService {
  constructor(protected externalBookingEventIdentifier: number) {
    super()
  }

  async perform() {
    const travelDeskBookingEvent = await TravelDeskBookingEvent.findOne({
      where: {
        externalTravelPortIdentifier: this.externalBookingEventIdentifier,
      },
    })
    if (isNil(travelDeskBookingEvent)) {
      throw new ServiceValidationError("The selected booking event was not found.")
    }

    if (isEmpty(travelDeskBookingEvent.airReservationSegments)) {
      throw new ServiceValidationError(
        "The selected booking event has no flight segments. Choose a different booking event."
      )
    }

    const { bookingReference } = travelDeskBookingEvent
    if (isNil(bookingReference)) {
      throw new ServiceValidationError("The selected booking event has no booking reference.")
    }

    const sourceAirSegmentNumbers = travelDeskBookingEvent.airReservationSegments.map(
      ({ airSegmentNumber }) => airSegmentNumber
    )
    return { bookingReference, sourceAirSegmentNumbers }
  }
}

export default LoadAndValidateTravelDeskBookingEventForInvoiceService
