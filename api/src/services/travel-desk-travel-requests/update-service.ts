import db, { TravelDeskTravelRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskTravelRequest>

export class UpdateService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    return db.transaction(async () => {
      await this.travelDeskTravelRequest.update(this.attributes)

      return this.travelDeskTravelRequest.reload({
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
    })
  }
}

export default UpdateService
