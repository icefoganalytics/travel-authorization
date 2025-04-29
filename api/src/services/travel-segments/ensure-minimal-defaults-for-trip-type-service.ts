import { Attributes, CreationAttributes } from "sequelize"

import { transaction } from "@/utils/transaction"
import BaseService from "@/services/base-service"

import { TravelSegment } from "@/models"
import TravelAuthorization, {
  TripTypes as TravelAuthorizationTripTypes,
} from "@/models/travel-authorization"
import { first, isNil, last } from "lodash"

export class EnsureMinimalDefaultsForTripTypeService extends BaseService {
  constructor(
    protected travelAuthorizationId: number,
    protected tripType: TravelAuthorizationTripTypes,
    protected isActual: boolean
  ) {
    super()
  }

  async perform(): Promise<TravelSegment[]> {
    const travelSegments = await TravelSegment.findAll({
      where: {
        travelAuthorizationId: this.travelAuthorizationId,
        isActual: this.isActual,
      },
    })
    return transaction(async () => {
      await TravelSegment.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: this.isActual,
        },
      })

      if (this.tripType === TravelAuthorization.TripTypes.ROUND_TRIP) {
        return this.ensureMinimalDefaultRoundTripTravelSegments(travelSegments)
      } else if (this.tripType === TravelAuthorization.TripTypes.ONE_WAY) {
        return this.ensureMinimalDefaultOneWayTravelSegments(travelSegments)
      } else if (this.tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
        return this.ensureMinimalDefaultMultiDestinationTravelSegments(travelSegments)
      } else {
        throw new Error("Invalid trip type")
      }
    })
  }

  private async ensureMinimalDefaultRoundTripTravelSegments(travelSegments: TravelSegment[]) {
    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)

    const newFirstTravelSegment = this.newBlankTravelSegmentAttributes({
      ...firstTravelSegment?.dataValues,
      modeOfTransport: firstTravelSegment?.modeOfTransport || TravelSegment.TravelMethods.AIRCRAFT,
      accommodationType:
        firstTravelSegment?.accommodationType || TravelSegment.AccommodationTypes.HOTEL,
      segmentNumber: 1,
    })
    const newLastTravelSegment = this.newBlankTravelSegmentAttributes({
      ...lastTravelSegment?.dataValues,
      modeOfTransport: lastTravelSegment?.modeOfTransport || TravelSegment.TravelMethods.AIRCRAFT,
      accommodationType: null,
      segmentNumber: 2,
    })
    return TravelSegment.bulkCreate([newFirstTravelSegment, newLastTravelSegment])
  }

  private async ensureMinimalDefaultOneWayTravelSegments(travelSegments: TravelSegment[]) {
    const firstTravelSegment = first(travelSegments)

    const newFirstTravelSegment = this.newBlankTravelSegmentAttributes({
      ...firstTravelSegment?.dataValues,
      accommodationType: null,
      modeOfTransport: firstTravelSegment?.modeOfTransport || TravelSegment.TravelMethods.AIRCRAFT,
      segmentNumber: 1,
    })
    return TravelSegment.bulkCreate([newFirstTravelSegment])
  }

  private async ensureMinimalDefaultMultiDestinationTravelSegments(
    travelSegments: TravelSegment[]
  ) {
    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)

    const newFirstTravelSegment = this.newBlankTravelSegmentAttributes({
      ...firstTravelSegment?.dataValues,
      modeOfTransport: firstTravelSegment?.modeOfTransport || TravelSegment.TravelMethods.AIRCRAFT,
      accommodationType:
        firstTravelSegment?.accommodationType || TravelSegment.AccommodationTypes.HOTEL,
      segmentNumber: 1,
    })
    const newLastTravelSegment = this.newBlankTravelSegmentAttributes({
      ...lastTravelSegment?.dataValues,
      modeOfTransport: lastTravelSegment?.modeOfTransport || TravelSegment.TravelMethods.AIRCRAFT,
      accommodationType: null,
      segmentNumber: 2,
    })
    return TravelSegment.bulkCreate([newFirstTravelSegment, newLastTravelSegment])
  }

  private newBlankTravelSegmentAttributes(
    attributes: Partial<Attributes<TravelSegment>>
  ): CreationAttributes<TravelSegment> {
    const { segmentNumber, modeOfTransport } = attributes
    if (isNil(segmentNumber)) {
      throw new Error("segmentNumber is required")
    }

    if (isNil(modeOfTransport)) {
      throw new Error("modeOfTransport is required")
    }

    return {
      ...attributes,
      segmentNumber,
      modeOfTransport,
      travelAuthorizationId: this.travelAuthorizationId,
      isActual: this.isActual,
    }
  }
}

export default EnsureMinimalDefaultsForTripTypeService
