import { isEmpty, isNil, last, first, pick } from "lodash"

import {
  Expense,
  Stop,
  TravelAuthorization,
  TravelDeskTravelRequest,
  TravelSegment,
  User,
} from "@/models"

import BaseSerializer from "./base-serializer"
import StopsSerializer, { StopDetailedView } from "./stops-serializer"
import UsersSerializer, { UserDetailedView } from "./users-serializer"

export type TravelAuthorizationDetailedView = Omit<
  Partial<TravelAuthorization>,
  "stops" | "user"
> & {
  stops: StopDetailedView[]
  user: UserDetailedView
}

export class TravelAuthorizationsSerializer extends BaseSerializer<TravelAuthorization> {
  static asTable(travelAuthorizations: TravelAuthorization[]) {
    return travelAuthorizations.map((travelAuthorization) => {
      const serializer = new this(travelAuthorization)
      return serializer.asTableRow()
    })
  }

  static asDetailed(record: TravelAuthorization): TravelAuthorizationDetailedView {
    const serializer = new this(record)
    return serializer.asDetailed()
  }

  private firstStop: Stop | undefined
  private lastStop: Stop | undefined
  private lastTravelSegment: TravelSegment | undefined
  private currentDate: Date
  private user: User

  constructor(record: TravelAuthorization) {
    super(record)
    this.firstStop = first(this.record.stops)
    this.lastStop = last(this.record.stops)
    this.lastTravelSegment = last(this.record.travelSegments)
    this.currentDate = new Date()

    // TODO: re-write this to use newer serializer pattern
    // and move this to a getter
    if (record.user === undefined) {
      throw new Error("TravelAuthorization must include an associated User")
    }

    this.user = record.user
  }

  asDetailed(): TravelAuthorizationDetailedView {
    return {
      ...this.record.dataValues,
      user: UsersSerializer.asDetailed(this.user),
      stops: this.record.stops?.map(StopsSerializer.asDetailed) || [],
    }
  }

  asTableRow() {
    return {
      ...pick(this.record, ["id", "eventName"]),
      finalDestination: this.lastStop?.location,
      departingAt: this.firstStop?.departureAt,
      returningAt: this.lastStop?.departureAt,
      phase: this.determinePhase(),
      status: this.determineStatus(),
      action: this.determineAction(),
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      department: this.user.department,
      branch: this.user.branch,
    }
  }

  // TODO: double check the order of these conditions
  determinePhase() {
    if (this.isDraft() || this.awaitingApproval()) {
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

  determineStatus() {
    if (this.isTravelling() && this.isApproved()) {
      return "travelling"
    } else {
      return this.record.status
    }
  }

  // TODO: double check the order of these conditions
  determineAction() {
    if (this.isDraft()) {
      return ["delete"]
    } else if (
      this.isApproved() &&
      this.anyTransportTypeIsAircraft() &&
      !this.travelDeskRequestIsSubmitted() &&
      !this.travelDeskRequestIsOptionsProvided() &&
      !this.travelDeskRequestIsOptionsRanked()
    ) {
      return ["submit_travel_desk_request"]
    } else if (
      this.isApproved() &&
      this.anyTransportTypeIsAircraft() &&
      this.travelDeskRequestIsOptionsProvided()
    ) {
      return ["travel_desk_options_provided"]
    } else if (this.isApproved() && this.travellingComplete()) {
      return ["submit_expense_claim"]
    } else if (this.travelDeskRequestIsComplete()) {
      return ["view_itinerary"]
    } else if (this.isApproved() && this.isTravelling()) {
      return ["add_expense"]
    } else if (this.isApproved() && this.anyTransportTypeIsPoolVehicle()) {
      return ["submit_pool_vehicle_request"]
    } else {
      return []
    }
  }

  isBooked() {
    return this.record.status === TravelAuthorization.Statuses.BOOKED
  }

  isDraft() {
    return this.record.status === TravelAuthorization.Statuses.DRAFT
  }

  isExpensed() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSED
  }

  isApproved() {
    return this.record.status === TravelAuthorization.Statuses.APPROVED
  }

  awaitingApproval() {
    return this.record.status === TravelAuthorization.Statuses.SUBMITTED
  }

  beforeTravelling() {
    if (isNil(this.firstStop) || isNil(this.firstStop.departureAt)) {
      return false
    }

    if (this.currentDate < this.firstStop.departureAt) {
      return true
    }

    return false
  }

  isTravelling() {
    if (
      isNil(this.firstStop) ||
      isNil(this.lastStop) ||
      isNil(this.firstStop.departureAt) ||
      isNil(this.lastStop.departureAt)
    ) {
      return false
    }

    if (
      this.firstStop.departureAt <= this.currentDate &&
      this.currentDate <= this.lastStop.departureAt
    ) {
      return true
    }

    return false
  }

  travellingComplete() {
    if (isNil(this.lastTravelSegment) || isNil(this.lastTravelSegment.departureAt)) {
      return this.legacyTravellingComplete() // Replace with false when Stop model is removed
    }

    if (this.currentDate > this.lastTravelSegment.departureAt) {
      return true
    }

    return false
  }

  legacyTravellingComplete() {
    if (isNil(this.lastStop) || isNil(this.lastStop.departureAt)) {
      return false
    }

    if (this.currentDate > this.lastStop.departureAt) {
      return true
    }

    return false
  }

  hasExpenses() {
    const expenses = this.record.expenses?.filter(
      (expense) => expense.type === Expense.Types.EXPENSE
    )
    return !isEmpty(expenses)
  }

  anyTransportTypeIsAircraft() {
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.AIRCRAFT)
  }

  anyTransportTypeIsPoolVehicle() {
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.POOL_VEHICLE)
  }

  travelDeskRequestIsSubmitted() {
    return (
      this.record.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.SUBMITTED
    )
  }

  travelDeskRequestIsOptionsProvided() {
    return (
      this.record.travelDeskTravelRequest?.status ===
      TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
    )
  }

  travelDeskRequestIsOptionsRanked() {
    return (
      this.record.travelDeskTravelRequest?.status ===
      TravelDeskTravelRequest.Statuses.OPTIONS_RANKED
    )
  }

  travelDeskRequestIsComplete() {
    return this.record.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.BOOKED
  }
}

export default TravelAuthorizationsSerializer
