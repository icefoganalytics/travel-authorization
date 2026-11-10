import { TRAVELPORT_DB_HOST, TRAVELPORT_DB_NAME, TRAVELPORT_DB_USER } from "@/config"
import logger from "@/utils/logger"

import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { IndexSerializer } from "@/integrations/travelport-integration/serializers/travel-order-events"
import db, { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import { normalizeRecordLocator } from "@/services/travel-desk-booking-events/normalize-record-locator"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

export class SyncService extends BaseService {
  constructor(protected recordLocator: string) {
    super()
  }

  async perform(): Promise<TravelDeskBookingEvent[]> {
    const recordLocator = normalizeRecordLocator(this.recordLocator)
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
