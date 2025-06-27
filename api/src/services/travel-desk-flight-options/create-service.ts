import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import formatDate from "@/utils/format-date"
import db, {
  TravelDeskFlightOption,
  User,
  TravelDeskFlightSegment,
  TravelDeskFlightRequest,
} from "@/models"
import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskFlightOption> & {
  flightSegmentsAttributes?: Partial<TravelDeskFlightSegment>[]
}

export class CreateService extends BaseService {
  constructor(
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskFlightOption> {
    const {
      flightRequestId,
      cost,
      duration,
      flightPreferenceOrder,
      flightSegmentsAttributes,
      ...optionalAttributes
    } = this.attributes

    if (isNil(flightRequestId)) {
      throw new Error("Flight request ID is required.")
    }

    if (isNil(cost)) {
      throw new Error("Cost is required.")
    }

    const leg = await this.generateLeg(flightRequestId, optionalAttributes.leg)

    if (isNil(duration)) {
      throw new Error("Duration is required.")
    }

    const travelerId = await this.ensureTravelerId(flightRequestId, optionalAttributes.travelerId)

    return db.transaction(async () => {
      const travelDeskFlightOption = await TravelDeskFlightOption.create({
        ...optionalAttributes,
        flightRequestId,
        travelerId,
        cost,
        leg,
        duration,
      })

      await this.bulkCreateTravelDeskFlightSegments(
        travelDeskFlightOption.id,
        flightSegmentsAttributes
      )

      return travelDeskFlightOption
    })
  }

  private async generateLeg(flightRequestId: number, leg?: string): Promise<string> {
    if (!isNil(leg)) return leg

    const flightRequest = await TravelDeskFlightRequest.findOne({
      where: { id: flightRequestId },
    })
    if (isNil(flightRequest)) {
      throw new Error("Could not find flight request, which is required to generate leg")
    }

    const { departLocation, arriveLocation, datePreference } = flightRequest
    const formattedDate = formatDate(datePreference)
    return `${departLocation} -> ${arriveLocation} @ ${formattedDate}`
  }

  private async ensureTravelerId(
    travelDeskFlightRequestId: number,
    travelerId?: number
  ): Promise<number> {
    if (!isNil(travelerId)) return travelerId

    const flightRequest = await TravelDeskFlightRequest.findOne({
      where: { id: travelDeskFlightRequestId },
      include: [
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
    if (isNil(flightRequest)) {
      throw new Error("Could not find flight request, which is required to ensure traveler ID")
    }

    const { travelRequest } = flightRequest
    if (isNil(travelRequest)) {
      throw new Error("Could not find travel request, which is required to ensure traveler ID")
    }

    const { travelAuthorization } = travelRequest
    if (isNil(travelAuthorization)) {
      throw new Error(
        "Could not find travel authorization, which is required to ensure traveler ID"
      )
    }

    return travelAuthorization.userId
  }

  private async bulkCreateTravelDeskFlightSegments(
    travelDeskFlightOptionId: number,
    flightSegmentsAttributes: Partial<TravelDeskFlightSegment>[] = []
  ): Promise<void> {
    const safeFlightSegmentsAttributes: CreationAttributes<TravelDeskFlightSegment>[] = []
    for (const {
      duration,
      departLocation,
      arriveLocation,
      status,
      flightNumber,
      departAt,
      arriveAt,
      class: klass,
      ...optionalAttributes
    } of flightSegmentsAttributes) {
      if (isNil(duration)) {
        throw new Error("Duration is required.")
      }

      if (isNil(departLocation)) {
        throw new Error("Depart location is required.")
      }

      if (isNil(arriveLocation)) {
        throw new Error("Arrive location is required.")
      }

      if (isNil(status)) {
        throw new Error("Status is required.")
      }

      if (isNil(flightNumber)) {
        throw new Error("Flight number is required.")
      }

      if (isNil(departAt)) {
        throw new Error("Depart at is required.")
      }

      if (isNil(arriveAt)) {
        throw new Error("Arrive at is required.")
      }

      if (isNil(klass)) {
        throw new Error("Class is required.")
      }

      safeFlightSegmentsAttributes.push({
        ...optionalAttributes,
        duration,
        departLocation,
        arriveLocation,
        status,
        flightNumber,
        departAt,
        arriveAt,
        class: klass,
        flightOptionId: travelDeskFlightOptionId,
      })
    }

    await TravelDeskFlightSegment.bulkCreate(safeFlightSegmentsAttributes)
  }
}

export default CreateService
