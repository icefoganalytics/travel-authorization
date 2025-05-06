import BaseService from "@/services/base-service"
import { TravelSegments } from "@/services"

import { TravelAuthorization } from "@/models"

export class BulkConvertStopsToTravelSegmentsService extends BaseService {
  private travelAuthorization: TravelAuthorization

  constructor(travelAuthorization: TravelAuthorization) {
    super()
    this.travelAuthorization = travelAuthorization
  }

  async perform(): Promise<TravelAuthorization> {
    await this.travelAuthorization.reload({
      include: [
        {
          association: "stops",
          include: ["location"],
        },
      ],
      order: [
        ["stops", "departureDate", "ASC"],
        ["stops", "departureTime", "ASC"],
      ],
    })

    const travelSegmentsAttributes = this.travelAuthorization
      .buildTravelSegmentsFromStops()
      .map((t) => t.dataValues)

    await TravelSegments.BulkReplaceService.perform(
      this.travelAuthorization.id,
      travelSegmentsAttributes,
      false
    )
    return this.travelAuthorization.reload({
      include: [
        {
          association: "travelSegments",
          include: ["departureLocation", "arrivalLocation"],
        },
      ],
      order: [["travelSegments", "segmentNumber", "ASC"]],
    })
  }
}

export default BulkConvertStopsToTravelSegmentsService
