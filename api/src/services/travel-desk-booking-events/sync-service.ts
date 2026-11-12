import { IsolationLevel, Op } from "@sequelize/core"
import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelPortIntegration } from "@/integrations"
import { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import WithSyncLockService from "@/services/travel-desk-booking-events/with-sync-lock-service"

export class SyncService extends BaseService {
  constructor(protected recordLocator: string) {
    super()
  }

  async perform(): Promise<void> {
    await WithSyncLockService.perform(this.recordLocator, async () => {
      const matchedSourceIds: number[] = []
      await this.syncSourceEvents(this.recordLocator, async (travelOrderEvent) => {
        const serializedTravelOrderEvent =
          TravelPortIntegration.Serializers.TravelOrderEvents.SyncSerializer.perform(travelOrderEvent)
        const { travelOrderIdentifier, ...travelOrderEventAttributes } = serializedTravelOrderEvent
        const travelDeskBookingEventAttributes = {
          ...travelOrderEventAttributes,
          externalTravelPortIdentifier: travelOrderIdentifier,
          recordLocator: this.recordLocator,
        }
        const travelDeskBookingEvent = await TravelDeskBookingEvent.findOne({
          where: { externalTravelPortIdentifier: travelOrderIdentifier },
        })
        if (isNil(travelDeskBookingEvent)) {
          await TravelDeskBookingEvent.create(travelDeskBookingEventAttributes)
        } else {
          await travelDeskBookingEvent.update(travelDeskBookingEventAttributes)
        }
        matchedSourceIds.push(travelOrderIdentifier)
      })

      await this.deleteUnmatchedBookingEvents(matchedSourceIds)
    })
  }

  private async deleteUnmatchedBookingEvents(matchedSourceIds: number[]): Promise<void> {
    await TravelDeskBookingEvent.destroy({
      where: {
        recordLocator: this.recordLocator,
        externalTravelPortIdentifier: {
          [Op.notIn]: matchedSourceIds,
        },
      },
    })
  }

  private async syncSourceEvents(
    recordLocator: string,
    processEvent: (event: TravelPortIntegration.Models.TravelOrderEvent) => Promise<void>
  ): Promise<void> {
    let processingFailed = false
    try {
      // Read locks keep the scan consistent but can delay feed writers until it finishes.
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

      logger.error("TravelPort booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }
}

export default SyncService
