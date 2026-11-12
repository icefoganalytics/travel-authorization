import { isEmpty, isNil, last, first, pick, isUndefined, sumBy } from "lodash"

import {
  Expense,
  Location,
  Stop,
  TravelAuthorization,
  TravelDeskTravelRequest,
  TravelSegment,
  User,
} from "@/models"

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
    const { expenses, status, tripType, tripTypeActual } = this.record
    const stops = this.stops
    const travelSegments = this.travelSegments
    const travelDeskTravelRequest = this.travelDeskTravelRequest
    const traveller = this.traveller
    const currentDate = new Date()

    const serializedLocations = this.serializeLocations(travelSegments, stops)

    const serializedTravelDeskTravelRequest =
      this.serializeTravelDeskTravelRequest(travelDeskTravelRequest)

    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)
    const departingAt = this.buildDepartingAt(firstTravelSegment, stops)
    const returningAt = this.buildReturningAt(lastTravelSegment, stops)

    const finalDestinationLocation = this.buildFinalDestinationLocation(
      tripType,
      travelSegments,
      tripTypeActual
    )
    const unprocessedExpenseCount = this.countUnprocessedExpenses(expenses)
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
      finalDestination: finalDestinationLocation,
      departingAt: departingAt?.toISOString(),
      returningAt: returningAt?.toISOString(),
      phase: this.determinePhase(status, travelSegments, expenses, currentDate),
      action: this.determineAction(status, travelSegments, travelDeskTravelRequest, currentDate),
      firstName: traveller.firstName,
      lastName: traveller.lastName,
      department: traveller.department,
      branch: traveller.branch,
      isTravelling: this.isTravelling(status, travelSegments, currentDate),
      unprocessedExpenseCount,
      locations: serializedLocations,
      travelDeskTravelRequest: serializedTravelDeskTravelRequest,
      ...stateFlagsAttributes,
    }
  }

  private serializeLocations(
    travelSegments: TravelSegment[] | undefined,
    stops: Stop[] | undefined
  ): Locations.AsReference[] {
    if (isUndefined(stops)) {
      throw new Error("Expected stops association to be pre-loaded.")
    }

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    const locations = this.buildLocations(travelSegments, stops)

    return Locations.ReferenceSerializer.perform(locations)
  }

  private serializeTravelDeskTravelRequest(
    travelDeskTravelRequest: TravelDeskTravelRequest | null | undefined
  ): TravelDeskTravelRequests.AsSummary | null {
    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travelDeskTravelRequest association to be pre-loaded.")
    }

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

  private buildFinalDestinationLocation(
    tripType: TravelAuthorization["tripType"],
    travelSegments: TravelSegment[],
    tripTypeActual: TravelAuthorization["tripTypeActual"]
  ): Locations.AsReference | null {
    const useActuals = !isNil(tripTypeActual)
    const destinationTravelSegments = travelSegments.filter(
      (travelSegment) => travelSegment.isActual === useActuals
    )
    const firstTravelSegment = first(destinationTravelSegments)
    const lastTravelSegment = last(destinationTravelSegments)
    const penultimateTravelSegment = destinationTravelSegments.at(-2)

    if (isNil(lastTravelSegment)) return null

    let finalDestinationLocation = lastTravelSegment.arrivalLocation
    if (tripType === TravelAuthorization.TripTypes.ROUND_TRIP) {
      finalDestinationLocation = lastTravelSegment.departureLocation
    } else if (
      tripType === TravelAuthorization.TripTypes.MULTI_CITY &&
      !isNil(penultimateTravelSegment) &&
      !isNil(firstTravelSegment?.departureLocationId) &&
      firstTravelSegment.departureLocationId === lastTravelSegment.arrivalLocationId
    ) {
      finalDestinationLocation = penultimateTravelSegment.arrivalLocation
    }

    if (isNil(finalDestinationLocation)) return null

    return Locations.ReferenceSerializer.perform(finalDestinationLocation)
  }

  private countUnprocessedExpenses(expenses: Expense[] | undefined): number {
    if (isUndefined(expenses)) {
      throw new Error("Expected expenses association to be pre-loaded.")
    }

    const unprocessedExpenseCount = sumBy(expenses, (expense) => {
      if (expense.type !== Expense.Types.EXPENSE) return 0
      if (!isNil(expense.approvedAt) || !isNil(expense.rejectedAt)) return 0

      return 1
    })

    return unprocessedExpenseCount
  }

  // TODO: double check the order of these conditions
  private determinePhase(
    status: TravelAuthorization["status"],
    travelSegments: TravelSegment[],
    expenses: Expense[] | undefined,
    currentDate: Date
  ) {
    if (this.isDraft(status) || this.isSubmitted(status)) {
      return "travel_approval"
    } else if (
      this.beforeTravelling(travelSegments, currentDate) &&
      (this.isApproved(status) || this.isBooked(status))
    ) {
      return "travel_planning"
    } else if (this.isTravelling(status, travelSegments, currentDate)) {
      return "travelling"
    } else if (this.travellingComplete(travelSegments, currentDate)) {
      return "travel_complete"
    } else if (this.hasExpenses(expenses)) {
      return "expensing"
    } else if (this.isExpensed(status)) {
      return "expensed"
    } else {
      return undefined
    }
  }

  // TODO: double check the order of these conditions
  private determineAction(
    status: TravelAuthorization["status"],
    travelSegments: TravelSegment[],
    travelDeskTravelRequest: TravelDeskTravelRequest | null,
    currentDate: Date
  ) {
    if (this.isDraft(status)) {
      return ["delete"]
    } else if (
      this.isApproved(status) &&
      this.isTravellingByAir(travelSegments) &&
      this.travelDeskIsDraft(travelDeskTravelRequest)
    ) {
      return ["submit_travel_desk_request"]
    } else if (
      this.isApproved(status) &&
      this.isTravellingByAir(travelSegments) &&
      this.travelDeskIsOptionsProvided(travelDeskTravelRequest)
    ) {
      return ["travel_desk_rank_options"]
    } else if (
      this.isApproved(status) &&
      this.travellingComplete(travelSegments, currentDate) &&
      ((this.isTravellingByAir(travelSegments) &&
        this.travelDeskIsComplete(travelDeskTravelRequest)) ||
        !this.isTravellingByAir(travelSegments))
    ) {
      return ["submit_expense_claim"]
    } else if (this.travelDeskIsComplete(travelDeskTravelRequest)) {
      return ["view_itinerary"]
    } else if (
      this.isApproved(status) &&
      this.isTravelling(status, travelSegments, currentDate) &&
      ((this.isTravellingByAir(travelSegments) &&
        this.travelDeskIsComplete(travelDeskTravelRequest)) ||
        !this.isTravellingByAir(travelSegments))
    ) {
      return ["add_expense"]
    } else if (this.isApproved(status) && this.anyTransportTypeIsPoolVehicle(travelSegments)) {
      return ["submit_pool_vehicle_request"]
    } else {
      return []
    }
  }

  private beforeTravelling(travelSegments: TravelSegment[], currentDate: Date) {
    const firstTravelSegment = first(travelSegments)

    if (isNil(firstTravelSegment) || isNil(firstTravelSegment.departureAt)) {
      return false
    }

    if (currentDate < firstTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private isTravelling(
    status: TravelAuthorization["status"],
    travelSegments: TravelSegment[],
    currentDate: Date
  ) {
    if (!this.isApproved(status)) return false

    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)

    if (
      isNil(firstTravelSegment) ||
      isNil(lastTravelSegment) ||
      isNil(firstTravelSegment.departureAt) ||
      isNil(lastTravelSegment.departureAt)
    ) {
      return false
    }

    if (
      firstTravelSegment.departureAt <= currentDate &&
      currentDate <= lastTravelSegment.departureAt
    ) {
      return true
    }

    return false
  }

  private travellingComplete(travelSegments: TravelSegment[], currentDate: Date) {
    const lastTravelSegment = last(travelSegments)

    if (isNil(lastTravelSegment) || isNil(lastTravelSegment.departureAt)) {
      return this.legacyTravellingComplete(travelSegments, currentDate) // Replace with false when Stop model is removed
    }

    if (currentDate > lastTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private legacyTravellingComplete(travelSegments: TravelSegment[], currentDate: Date) {
    const lastTravelSegment = last(travelSegments)

    if (isNil(lastTravelSegment) || isNil(lastTravelSegment.departureAt)) {
      return false
    }

    if (currentDate > lastTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private hasExpenses(expenses: Expense[] | undefined) {
    const expenseClaims = expenses?.filter((expense) => expense.type === Expense.Types.EXPENSE)
    return !isEmpty(expenseClaims)
  }

  private isTravellingByAir(travelSegments: TravelSegment[]) {
    return travelSegments.some(
      (travelSegment) => travelSegment.modeOfTransport === TravelSegment.TravelMethods.AIRCRAFT
    )
  }

  private anyTransportTypeIsPoolVehicle(travelSegments: TravelSegment[]) {
    return travelSegments.some(
      (travelSegment) => travelSegment.modeOfTransport === TravelSegment.TravelMethods.POOL_VEHICLE
    )
  }

  private isBooked(status: TravelAuthorization["status"]) {
    return status === TravelAuthorization.Statuses.BOOKED
  }

  private isDraft(status: TravelAuthorization["status"]) {
    return status === TravelAuthorization.Statuses.DRAFT
  }

  private isExpensed(status: TravelAuthorization["status"]) {
    return status === TravelAuthorization.Statuses.EXPENSED
  }

  private isApproved(status: TravelAuthorization["status"]) {
    return status === TravelAuthorization.Statuses.APPROVED
  }

  private isSubmitted(status: TravelAuthorization["status"]) {
    return status === TravelAuthorization.Statuses.SUBMITTED
  }

  private travelDeskIsDraft(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    return travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.DRAFT
  }

  private travelDeskIsOptionsProvided(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    return travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
  }

  private travelDeskIsComplete(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    return travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.COMPLETE
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

  private get stops(): Stop[] {
    const { stops } = this.record
    if (isUndefined(stops)) {
      throw new Error("Expected stops association to be pre-loaded")
    }

    return stops
  }

  private get traveller(): User {
    const { user } = this.record

    if (isUndefined(user)) {
      throw new Error("Expected user association to be pre-loaded")
    }

    return user
  }

  private get travelDeskTravelRequest(): TravelDeskTravelRequest | null {
    const { travelDeskTravelRequest } = this.record

    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travelDeskTravelRequest asssociation to be pre-loaded")
    }

    return travelDeskTravelRequest
  }

  private get travelSegments(): TravelSegment[] {
    const { travelSegments } = this.record

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded")
    }

    return travelSegments
  }
}

export default IndexSerializer
