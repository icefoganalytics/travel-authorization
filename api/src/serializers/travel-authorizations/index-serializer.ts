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
    const { stops, travelSegments, travelDeskTravelRequest } = this.record

    const serializedLocations = this.serializeLocations(travelSegments, stops)

    const serializedTravelDeskTravelRequest =
      this.serializeTravelDeskTravelRequest(travelDeskTravelRequest)

    const departingAt = this.buildDepartingAt(this.firstTravelSegment, this.stops)
    const returningAt = this.buildReturningAt(this.lastTravelSegment, this.stops)

    const finalDestinationLocation = this.buildFinalDestinationLocation()
    const unprocessedExpenseCount = this.countUnprocessedExpenses()
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
      phase: this.determinePhase(),
      action: this.determineAction(),
      firstName: this.traveller.firstName,
      lastName: this.traveller.lastName,
      department: this.traveller.department,
      branch: this.traveller.branch,
      isTravelling: this.isTravelling(),
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

  private buildFinalDestinationLocation() {
    const useActuals = !isNil(this.record.tripTypeActual)
    const travelSegments = this.travelSegments.filter(
      (travelSegment) => travelSegment.isActual === useActuals
    )
    const firstTravelSegment = first(travelSegments)
    const lastTravelSegment = last(travelSegments)
    if (isNil(lastTravelSegment)) return null

    let finalDestinationLocation = lastTravelSegment.arrivalLocation
    if (this.record.tripType === TravelAuthorization.TripTypes.ROUND_TRIP) {
      finalDestinationLocation = lastTravelSegment.departureLocation
    } else if (
      this.record.tripType === TravelAuthorization.TripTypes.MULTI_CITY &&
      travelSegments.length > 1 &&
      !isNil(firstTravelSegment?.departureLocationId) &&
      firstTravelSegment.departureLocationId === lastTravelSegment.arrivalLocationId
    ) {
      finalDestinationLocation = travelSegments[travelSegments.length - 2]?.arrivalLocation
    }

    if (isNil(finalDestinationLocation)) return null

    return Locations.ReferenceSerializer.perform(finalDestinationLocation)
  }

  private countUnprocessedExpenses(): number {
    const { expenses } = this.record
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
  private determinePhase() {
    if (this.isDraft() || this.isSubmitted()) {
      return "travel_approval"
    } else if (this.beforeTravelling() && (this.isApproved() || this.isBooked())) {
      return "travel_planning"
    } else if (this.isTravelling()) {
      return "travelling"
    } else if (this.travellingComplete()) {
      return "travel_complete"
    } else if (this.hasExpenses()) {
      return "expensing"
    } else if (this.isExpensed()) {
      return "expensed"
    } else {
      return undefined
    }
  }

  // TODO: double check the order of these conditions
  private determineAction() {
    if (this.isDraft()) {
      return ["delete"]
    } else if (this.isApproved() && this.isTravellingByAir() && this.travelDeskIsDraft()) {
      return ["submit_travel_desk_request"]
    } else if (
      this.isApproved() &&
      this.isTravellingByAir() &&
      this.travelDeskIsOptionsProvided()
    ) {
      return ["travel_desk_rank_options"]
    } else if (
      this.isApproved() &&
      this.travellingComplete() &&
      ((this.isTravellingByAir() && this.travelDeskIsComplete()) || !this.isTravellingByAir())
    ) {
      return ["submit_expense_claim"]
    } else if (this.travelDeskIsComplete()) {
      return ["view_itinerary"]
    } else if (
      this.isApproved() &&
      this.isTravelling() &&
      ((this.isTravellingByAir() && this.travelDeskIsComplete()) || !this.isTravellingByAir())
    ) {
      return ["add_expense"]
    } else if (this.isApproved() && this.anyTransportTypeIsPoolVehicle()) {
      return ["submit_pool_vehicle_request"]
    } else {
      return []
    }
  }

  private beforeTravelling() {
    if (isNil(this.firstTravelSegment) || isNil(this.firstTravelSegment.departureAt)) {
      return false
    }

    if (this.currentDate < this.firstTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private isTravelling() {
    if (!this.isApproved()) return false
    if (
      isNil(this.firstTravelSegment) ||
      isNil(this.lastTravelSegment) ||
      isNil(this.firstTravelSegment.departureAt) ||
      isNil(this.lastTravelSegment.departureAt)
    ) {
      return false
    }

    if (
      this.firstTravelSegment.departureAt <= this.currentDate &&
      this.currentDate <= this.lastTravelSegment.departureAt
    ) {
      return true
    }

    return false
  }

  private travellingComplete() {
    if (isNil(this.lastTravelSegment) || isNil(this.lastTravelSegment.departureAt)) {
      return this.legacyTravellingComplete() // Replace with false when Stop model is removed
    }

    if (this.currentDate > this.lastTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private legacyTravellingComplete() {
    if (isNil(this.lastTravelSegment) || isNil(this.lastTravelSegment.departureAt)) {
      return false
    }

    if (this.currentDate > this.lastTravelSegment.departureAt) {
      return true
    }

    return false
  }

  private hasExpenses() {
    const expenses = this.record.expenses?.filter(
      (expense) => expense.type === Expense.Types.EXPENSE
    )
    return !isEmpty(expenses)
  }

  private isTravellingByAir() {
    return this.travelSegments.some(
      (travelSegment) => travelSegment.modeOfTransport === TravelSegment.TravelMethods.AIRCRAFT
    )
  }

  private anyTransportTypeIsPoolVehicle() {
    return this.travelSegments.some(
      (travelSegment) => travelSegment.modeOfTransport === TravelSegment.TravelMethods.POOL_VEHICLE
    )
  }

  private isBooked() {
    return this.record.status === TravelAuthorization.Statuses.BOOKED
  }

  private isDraft() {
    return this.record.status === TravelAuthorization.Statuses.DRAFT
  }

  private isExpensed() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSED
  }

  private isApproved() {
    return this.record.status === TravelAuthorization.Statuses.APPROVED
  }

  private isSubmitted() {
    return this.record.status === TravelAuthorization.Statuses.SUBMITTED
  }

  private travelDeskIsDraft() {
    return this.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.DRAFT
  }

  private travelDeskIsOptionsProvided() {
    return (
      this.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
    )
  }

  private travelDeskIsComplete() {
    return this.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.COMPLETE
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

  private get firstTravelSegment(): TravelSegment | undefined {
    return first(this.travelSegments)
  }

  private get lastTravelSegment(): TravelSegment | undefined {
    return last(this.travelSegments)
  }

  private get currentDate(): Date {
    return new Date()
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
