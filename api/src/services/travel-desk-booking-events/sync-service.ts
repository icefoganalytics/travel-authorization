import { IsolationLevel, Op } from "@sequelize/core"
import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelPortIntegration } from "@/integrations"
import { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import WithSyncLockService from "@/services/travel-desk-booking-events/with-sync-lock-service"

export class SyncService extends BaseService {
  constructor(protected bookingReference: string) {
    super()
    this.bookingReference = bookingReference.trim().toUpperCase()
  }

  async perform(): Promise<void> {
    await WithSyncLockService.perform(this.bookingReference, async () => {
      const matchedSourceIds: number[] = []
      await this.syncTravelOrderEvents(this.bookingReference, async (travelOrderEvent) => {
        const travelDeskBookingEventAttributes =
          TravelPortIntegration.Serializers.TravelOrderEvents.SyncSerializer.perform(
            travelOrderEvent,
            this.bookingReference
          )
        const { externalTravelPortIdentifier } = travelDeskBookingEventAttributes
        const travelDeskBookingEvent = await TravelDeskBookingEvent.findOne({
          where: { externalTravelPortIdentifier },
        })
        if (isNil(travelDeskBookingEvent)) {
          await TravelDeskBookingEvent.create(travelDeskBookingEventAttributes)
        } else {
          await travelDeskBookingEvent.update(travelDeskBookingEventAttributes)
        }
        matchedSourceIds.push(externalTravelPortIdentifier)
      })

      await this.deleteUnmatchedBookingEvents(matchedSourceIds)
    })
  }

  /**
   * Reads source events and their associations in one SQL Server SERIALIZABLE transaction.
   * The caller passes the application's booking reference as recordLocator because
   * Travelport identifies the same booking using its original recordLocator field.
   *
   * Shared and key-range locks prevent concurrent changes from shifting offset-based
   * batches or changing relationships already read. Otherwise, a skipped source event
   * could be mistaken for a deletion during local reconciliation.
   *
   * The source transaction performs no writes, but holds read locks until all batches
   * and their local processing finish. Conflicting feed inserts, updates, and deletes
   * may wait; the lock footprint depends on SQL Server's query plan and lock escalation.
   * A source read or commit failure propagates to roll back the enclosing local refresh.
   */
  private async syncTravelOrderEvents(
    recordLocator: string,
    processEvent: (event: TravelPortIntegration.Models.TravelOrderEvent) => Promise<void>
  ): Promise<void> {
    let processingFailed = false
    try {
      await TravelPortIntegration.db.transaction(
        { isolationLevel: IsolationLevel.SERIALIZABLE },
        async () => {
          await TravelPortIntegration.Models.TravelOrderEvent.findEach(
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
        }
      )
    } catch (error) {
      if (processingFailed) throw error

      logger.error("Travelport booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }

  private async deleteUnmatchedBookingEvents(matchedSourceIds: number[]): Promise<void> {
    await TravelDeskBookingEvent.destroy({
      where: {
        bookingReference: this.bookingReference,
        externalTravelPortIdentifier: {
          [Op.notIn]: matchedSourceIds,
        },
      },
    })
  }
}

export default SyncService
