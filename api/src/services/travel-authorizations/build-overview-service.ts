import { first, isEmpty, isNil, last, sumBy } from "lodash"

import {
  Expense,
  Location,
  TravelAuthorization,
  TravelDeskTravelRequest,
  TravelSegment,
} from "@/models"

import BaseService from "@/services/base-service"

export type TravelAuthorizationOverviewInput = Pick<
  TravelAuthorization,
  "status" | "tripType" | "tripTypeActual"
> & {
  travelSegments: TravelSegment[]
  expenses: Expense[]
  travelDeskTravelRequest: TravelDeskTravelRequest | null
}

export type TravelAuthorizationOverview = {
  finalDestination: Location | null
  phase: string | undefined
  action: string[]
  isTravelling: boolean
  unprocessedExpenseCount: number
}

export class BuildOverviewService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorizationOverviewInput,
    protected currentDate: Date
  ) {
    super()
  }

  perform(): TravelAuthorizationOverview {
    const { status, tripType, tripTypeActual, travelSegments, expenses, travelDeskTravelRequest } =
      this.travelAuthorization
    const currentDate = this.currentDate
    const finalDestination = this.buildFinalDestinationLocation(
      tripType,
      travelSegments,
      tripTypeActual
    )
    const phase = this.determinePhase(status, travelSegments, expenses, currentDate)
    const action = this.determineAction(
      status,
      travelSegments,
      travelDeskTravelRequest,
      currentDate
    )
    const isTravelling = this.isTravelling(status, travelSegments, currentDate)
    const unprocessedExpenseCount = this.countUnprocessedExpenses(expenses)

    return {
      finalDestination,
      phase,
      action,
      isTravelling,
      unprocessedExpenseCount,
    }
  }

  private buildFinalDestinationLocation(
    tripType: TravelAuthorization["tripType"],
    travelSegments: TravelSegment[],
    tripTypeActual: TravelAuthorization["tripTypeActual"]
  ): Location | null {
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

    return finalDestinationLocation
  }

  private countUnprocessedExpenses(expenses: Expense[]): number {
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
}

export default BuildOverviewService
