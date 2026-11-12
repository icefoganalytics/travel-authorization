import { IsolationLevel, Op } from "@sequelize/core"

import logger from "@/utils/logger"

import travelportDatabase, { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { TravelOrderEvents } from "@/integrations/travelport-integration/serializers"
import { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import WithSyncLockService from "@/services/travel-desk-booking-events/with-sync-lock-service"

export class SyncService extends BaseService {
  constructor(protected recordLocator: string) {
    super()
  }

  async perform(): Promise<void> {
    this.assertRecordLocatorIsValid(this.recordLocator)

    await WithSyncLockService.perform(this.recordLocator, async () => {
      const matchedSourceIds: number[] = []
      await this.syncSourceEvents(this.recordLocator, async (sourceEvent) => {
        const serializedSourceEvent = TravelOrderEvents.SyncSerializer.perform(sourceEvent)
        const { travelOrderIdentifier, ...sourceAttributes } = serializedSourceEvent
        const attributes = {
          ...sourceAttributes,
          externalTravelportIdentifier: travelOrderIdentifier,
          recordLocator: this.recordLocator,
        }
        const bookingEvent = await TravelDeskBookingEvent.findOne({
          where: { externalTravelportIdentifier: travelOrderIdentifier },
          paranoid: false,
        })
        if (bookingEvent === null) {
          await TravelDeskBookingEvent.create(attributes)
        } else {
          await bookingEvent.update(attributes)
          if (bookingEvent.deletedAt !== null) {
            await bookingEvent.restore()
          }
        }
        matchedSourceIds.push(travelOrderIdentifier)
      })

      // Only remove unmatched events after the complete source scan succeeds.
      await TravelDeskBookingEvent.destroy({
        where: {
          recordLocator: this.recordLocator,
          externalTravelportIdentifier: { [Op.notIn]: matchedSourceIds },
        },
      })
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
      // Read locks keep the scan consistent but can delay feed writers until it finishes.
      await travelportDatabase.transaction(
        { isolationLevel: IsolationLevel.SERIALIZABLE },
        async () => {
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
              // Serializable source reads keep offset batches stable during reconciliation.
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
}

export default SyncService
