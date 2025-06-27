import { isEmpty, isNil } from "lodash"
import { DateTime } from "luxon"

import db, { TravelDeskFlightRequest, TravelDeskTravelRequest, TravelSegment, User } from "@/models"
import { TravelDeskFlightRequestTimePreferences } from "@/models/travel-desk-flight-request"
import BaseService from "@/services/base-service"
import { TravelDeskFlightRequests } from "@/services"

export class PrefillFlightRequestsService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected travelSegments: TravelSegment[],
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskFlightRequest[]> {
    if (isEmpty(this.travelSegments)) {
      throw new Error("Travel segments must have at least one element to prefill flight requests.")
    }

    const travelDeskFlightRequests: TravelDeskFlightRequest[] = []

    return db.transaction(async () => {
      for (const travelSegment of this.travelSegments) {
        const newTravelDeskFlightRequest = await this.createFlightRequestFrom(travelSegment)
        travelDeskFlightRequests.push(newTravelDeskFlightRequest)
      }

      return travelDeskFlightRequests
    })
  }

  private async createFlightRequestFrom(travelSegment: TravelSegment) {
    const { departureLocation, arrivalLocation, departureOn, departureTime } = travelSegment
    if (isNil(departureLocation)) {
      throw new Error(`Departure location not found for travel segment: ${travelSegment.id}`)
    }

    if (isNil(arrivalLocation)) {
      throw new Error(`Arrival location not found for travel segment: ${travelSegment.id}`)
    }

    if (isNil(departureOn)) {
      throw new Error(`Departure date not found for travel segment: ${travelSegment.id}`)
    }

    let departureOnAsDate
    if (departureOn instanceof Date) {
      departureOnAsDate = departureOn
    } else {
      departureOnAsDate = DateTime.fromFormat(departureOn, "yyyy-LL-dd").toJSDate()
    }

    const timePreference = this.determineTimePreference(departureTime)

    const travelDeskFlightRequest = await TravelDeskFlightRequests.CreateService.perform(
      {
        travelRequestId: this.travelDeskTravelRequest.id,
        departLocation: departureLocation.city,
        arriveLocation: arrivalLocation.city,
        datePreference: departureOnAsDate,
        timePreference,
        seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
      },
      this.currentUser
    )
    return travelDeskFlightRequest
  }

  private determineTimePreference(
    departureTime: string | null
  ): TravelDeskFlightRequestTimePreferences {
    if (isNil(departureTime)) {
      return TravelDeskFlightRequest.TimePreferences.AM
    }

    const datetime = DateTime.fromISO(departureTime)
    if (datetime.hour >= 12) {
      return TravelDeskFlightRequest.TimePreferences.PM
    }

    return TravelDeskFlightRequest.TimePreferences.AM
  }
}

export default PrefillFlightRequestsService
