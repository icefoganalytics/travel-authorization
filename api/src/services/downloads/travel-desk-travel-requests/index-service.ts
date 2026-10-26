import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelDeskTravelRequest, type User } from "@/models"
import {
  ReportSerializer,
  type TravelDeskTravelRequestAsReport,
} from "@/serializers/travel-desk-travel-requests"
import BaseService from "@/services/base-service"

export class IndexService extends BaseService {
  constructor(
    private scopedTravelDeskTravelRequests: ModelStatic<TravelDeskTravelRequest>,
    private where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequestAsReport[]> {
    // Exports include every match, without list pagination or a total-count query.
    const travelDeskTravelRequests = await this.scopedTravelDeskTravelRequests.findAll({
      where: this.where,
      order: this.order,
      include: [
        "flightRequests",
        "hotels",
        "otherTransportations",
        "passengerNameRecordDocument",
        "rentalCars",
        {
          association: "travelAuthorization",
          required: true,
          include: [
            "user",
            {
              association: "travelSegments",
              separate: true,
              order: [["segmentNumber", "ASC"]],
              include: ["departureLocation", "arrivalLocation"],
            },
          ],
        },
      ],
    })
    const serializedTravelDeskTravelRequests = ReportSerializer.perform(
      travelDeskTravelRequests,
      this.currentUser
    )

    return serializedTravelDeskTravelRequests
  }
}

export default IndexService
