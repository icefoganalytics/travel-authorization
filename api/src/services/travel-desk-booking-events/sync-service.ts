import logger from "@/utils/logger"

import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { SyncSerializer } from "@/integrations/travelport-integration/serializers/travel-order-events"
import db, { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

export class SyncService extends BaseService {
  constructor(protected recordLocator: string) {
    super()
  }

  async perform(): Promise<TravelDeskBookingEvent[]> {
    const recordLocator = this.recordLocator.trim().toUpperCase()
    this.assertRecordLocatorIsValid(recordLocator)

    return db.transaction(async (transaction) => {
      const bookingEvents: TravelDeskBookingEvent[] = []
      await this.syncSourceEvents(recordLocator, async (sourceEvent) => {
        const serializedSourceEvent = SyncSerializer.perform(sourceEvent)
        const { travelOrderIdentifier, ...sourceAttributes } = serializedSourceEvent
        const sourceRecordLocator = sourceAttributes.recordLocator?.toUpperCase() ?? null
        const attributes = {
          ...sourceAttributes,
          externalTravelportIdentifier: travelOrderIdentifier,
          recordLocator: sourceRecordLocator,
        }
        let bookingEvent = await TravelDeskBookingEvent.findOne({
          where: { externalTravelportIdentifier: travelOrderIdentifier },
          transaction,
        })
        if (bookingEvent === null) {
          bookingEvent = await TravelDeskBookingEvent.create(attributes, { transaction })
        } else {
          await bookingEvent.update(attributes, { transaction })
        }
        bookingEvents.push(bookingEvent)
      })

      return bookingEvents
    })
  }

  private assertRecordLocatorIsValid(recordLocator: string): void {
    if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }
  }

  private async syncSourceEvents(
    recordLocator: string,
    processEvent: (event: TravelOrderEvent) => Promise<void>
  ): Promise<void> {
    let processingFailed = false
    try {
      await TravelOrderEvent.findEach(
        {
          where: { recordLocator },
          include: [
            {
              association: "passengers",
              separate: true,
              order: [
                ["lastNameElement", "ASC"],
                ["passengerElement", "ASC"],
              ],
            },
            {
              association: "airReservationSegments",
              separate: true,
              order: [["airSegmentNumber", "ASC"]],
            },
            { association: "serviceFeeTransaction" },
          ],
          // Unique, immutable source key keeps batch boundaries stable.
          order: [["travelOrderIdentifier", "ASC"]],
        },
        async (event) => {
          try {
            await processEvent(event)
          } catch (error) {
            processingFailed = true
            throw error
          }
        }
      )
    } catch (error) {
      if (processingFailed) throw error

      logger.error("Travelport booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }
}

export default SyncService
