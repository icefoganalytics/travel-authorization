import { TRAVELPORT_DB_HOST, TRAVELPORT_DB_NAME, TRAVELPORT_DB_USER } from "@/config"
import logger from "@/utils/logger"

import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { IndexSerializer } from "@/integrations/travelport-integration/serializers/travel-order-events"
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
    this.validateRecordLocator(recordLocator)

    const sourceEvents = await this.fetchSourceEvents(recordLocator)
    const serializedSourceEvents = IndexSerializer.perform(sourceEvents)

    return db.transaction(async (transaction) => {
      const bookingEvents: TravelDeskBookingEvent[] = []
      for (const serializedSourceEvent of serializedSourceEvents) {
        const { travelOrderIdentifier, ...sourceAttributes } = serializedSourceEvent
        const attributes = {
          ...sourceAttributes,
          externalTravelportIdentifier: travelOrderIdentifier,
          recordLocator: sourceAttributes.recordLocator?.toUpperCase() ?? null,
        }
        const [bookingEvent] = await TravelDeskBookingEvent.upsert(attributes, {
          transaction,
          returning: true,
        })
        bookingEvents.push(bookingEvent)
      }

      return bookingEvents
    })
  }

  private validateRecordLocator(recordLocator: string): void {
    if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }
  }

  private async fetchSourceEvents(recordLocator: string): Promise<TravelOrderEvent[]> {
    if (!TRAVELPORT_DB_HOST || !TRAVELPORT_DB_NAME || !TRAVELPORT_DB_USER) {
      throw new SourceUnavailableError("Booking source is not configured.")
    }

    try {
      return await TravelOrderEvent.findAllByRecordLocator(recordLocator)
    } catch (error) {
      logger.error("Travelport booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }
}

export default SyncService
