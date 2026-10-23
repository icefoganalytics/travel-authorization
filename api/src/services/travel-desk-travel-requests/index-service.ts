import { type Attributes, type WhereOptions } from "@sequelize/core"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelDeskTravelRequest, type User } from "@/models"
import { type BaseScopeOptions, TravelDeskTravelRequestsPolicy } from "@/policies"
import BaseService from "@/services/base-service"

export class IndexService extends BaseService {
  constructor(
    private where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    private scopes: BaseScopeOptions[],
    private order: ModelOrder[] | undefined,
    private limit: number | undefined,
    private offset: number | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<{
    travelDeskTravelRequests: TravelDeskTravelRequest[]
    totalCount: number
  }> {
    const scopedTravelDeskTravelRequests = TravelDeskTravelRequestsPolicy.applyScope(
      this.scopes,
      this.currentUser
    )

    const totalCount = await scopedTravelDeskTravelRequests.count({ where: this.where })
    const travelDeskTravelRequests = await scopedTravelDeskTravelRequests.findAll({
      where: this.where,
      order: this.order,
      limit: this.limit,
      offset: this.offset,
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

    return {
      travelDeskTravelRequests,
      totalCount,
    }
  }
}

export default IndexService
