import { isNil, last, first, pick, isUndefined } from "lodash"

import {
  Location,
  Stop,
  TravelAuthorization,
  TravelDeskTravelRequest,
  TravelSegment,
  User,
} from "@/models"

import { BuildSummaryService } from "@/services/travel-authorizations"

import BaseSerializer from "@/serializers/base-serializer"
import {
  StateFlagsSerializer,
  type TravelAuthorizationStateFlagsView,
} from "@/serializers/travel-authorizations/state-flags-serializer"
import { Locations, TravelDeskTravelRequests } from "@/serializers"

export type TravelAuthorizationIndexView = Pick<
  TravelAuthorization,
  | "id"
  | "eventName"
  | "purposeId"
  | "wizardStepName"
  | "status"
  | "dateBackToWorkEstimate"
  | "createdAt"
  | "updatedAt"
> & {
  // Computed fields
  purposeText: string
  departingAt?: string | null
  returningAt?: string | null
  phase?: string
  action?: string[]
  firstName: string | null
  lastName: string | null
  department: string | null
  branch: string | null
  isTravelling: boolean
  unprocessedExpenseCount: number
} & {
  // Associations
  finalDestination: Locations.AsReference | null
  locations: Locations.AsReference[]
  travelDeskTravelRequest: TravelDeskTravelRequests.AsSummary | null
} & TravelAuthorizationStateFlagsView

export class IndexSerializer extends BaseSerializer<TravelAuthorization> {
  constructor(
    protected record: TravelAuthorization,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationIndexView {
    const {
      expenses,
      stops,
      travelSegments,
      travelDeskTravelRequest,
      user: traveller,
      status,
      tripType,
      tripTypeActual,
    } = this.record

    if (isUndefined(expenses)) {
      throw new Error("Expected expenses association to be pre-loaded.")
    }

    if (isUndefined(stops)) {
      throw new Error("Expected stops association to be pre-loaded.")
    }

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travelDeskTravelRequest association to be pre-loaded.")
    }

    if (isUndefined(traveller)) {
      throw new Error("Expected user association to be pre-loaded.")
    }

    const currentDate = new Date()

    const serializedLocations = this.serializeLocations(travelSegments, stops)

    const serializedTravelDeskTravelRequest =
      this.serializeTravelDeskTravelRequest(travelDeskTravelRequest)

    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)
    const departingAt = this.buildDepartingAt(firstTravelSegment, stops)
    const returningAt = this.buildReturningAt(lastTravelSegment, stops)

    const summaryInput = {
      status,
      tripType,
      tripTypeActual,
      travelSegments,
      expenses,
      travelDeskTravelRequest,
    }
    const summary = BuildSummaryService.perform(summaryInput, currentDate)
    const finalDestination = isNil(summary.finalDestination)
      ? null
      : Locations.ReferenceSerializer.perform(summary.finalDestination)
    const stateFlagsAttributes = StateFlagsSerializer.perform(this.record)

    return {
      ...pick(this.record, [
        "id",
        "eventName",
        "purposeId",
        "wizardStepName",
        "status",
        "dateBackToWorkEstimate",
        "createdAt",
        "updatedAt",
      ]),
      // computed fields
      purposeText: this.record.purpose?.purpose ?? "",
      finalDestination,
      departingAt: departingAt?.toISOString(),
      returningAt: returningAt?.toISOString(),
      phase: summary.phase,
      action: summary.action,
      firstName: traveller.firstName,
      lastName: traveller.lastName,
      department: traveller.department,
      branch: traveller.branch,
      isTravelling: summary.isTravelling,
      unprocessedExpenseCount: summary.unprocessedExpenseCount,
      locations: serializedLocations,
      travelDeskTravelRequest: serializedTravelDeskTravelRequest,
      ...stateFlagsAttributes,
    }
  }

  private serializeLocations(
    travelSegments: TravelSegment[],
    stops: Stop[]
  ): Locations.AsReference[] {
    const locations = this.buildLocations(travelSegments, stops)

    return Locations.ReferenceSerializer.perform(locations)
  }

  private serializeTravelDeskTravelRequest(
    travelDeskTravelRequest: TravelDeskTravelRequest | null
  ): TravelDeskTravelRequests.AsSummary | null {
    if (isNil(travelDeskTravelRequest)) return null

    return TravelDeskTravelRequests.SummarySerializer.perform(travelDeskTravelRequest)
  }

  private buildLocations(travelSegments: TravelSegment[], stops: Stop[]): Location[] {
    const locations = new Map<number, Location>()
    if (travelSegments.length > 0) {
      for (const { departureLocation, arrivalLocation } of travelSegments) {
        if (isUndefined(departureLocation) || isUndefined(arrivalLocation)) {
          throw new Error("Expected travel segment locations to be pre-loaded.")
        }

        if (!isNil(departureLocation)) {
          locations.set(departureLocation.id, departureLocation)
        }

        if (!isNil(arrivalLocation)) {
          locations.set(arrivalLocation.id, arrivalLocation)
        }
      }
    } else {
      for (const { location } of stops) {
        if (isUndefined(location)) {
          throw new Error("Expected stop location association to be pre-loaded.")
        }

        if (!isNil(location)) {
          locations.set(location.id, location)
        }
      }
    }

    return Array.from(locations.values())
  }

  private buildDepartingAt(
    firstTravelSegment: TravelSegment | undefined,
    stops: Stop[]
  ): Date | null | undefined {
    if (isNil(firstTravelSegment)) {
      const firstStop = first(stops)

      return firstStop?.departureAt
    }

    const departingAt = firstTravelSegment.departureAt
    if (!isNil(departingAt)) return departingAt

    const firstStop = first(stops)

    return firstStop?.departureAt
  }

  private buildReturningAt(
    lastTravelSegment: TravelSegment | undefined,
    stops: Stop[]
  ): Date | null | undefined {
    if (isNil(lastTravelSegment)) {
      const lastStop = last(stops)

      return lastStop?.departureAt
    }

    const returningAt = lastTravelSegment.departureAt
    if (!isNil(returningAt)) return returningAt

    const lastStop = last(stops)

    return lastStop?.departureAt
  }
}

export default IndexSerializer
