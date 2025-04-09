import { isEmpty, isNil, last, first, pick } from "lodash"

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

export type TravelAuthorizationIndexView = Pick<
  TravelAuthorization,
  "id" | "eventName" | "purposeId" | "wizardStepName" | "status" | "createdAt" | "updatedAt"
> & {
  // computed fields
  purposeText: string
  finalDestination?: Pick<Location, "id" | "city" | "province" | "createdAt" | "updatedAt">
  departingAt?: string | null
  returningAt?: string | null
  phase?: string
  action?: string[]
  firstName: string | null
  lastName: string | null
  department: string | null
  branch: string | null
  isTravelling: boolean
} & TravelAuthorizationStateFlagsView

export class IndexSerializer extends BaseSerializer<TravelAuthorization> {
  constructor(
    protected record: TravelAuthorization,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationIndexView {
    const stateFlagsAttributes = StateFlagsSerializer.perform(this.record, this.currentUser)

    return {
      ...pick(this.record, [
        "id",
        "eventName",
        "purposeId",
        "wizardStepName",
        "status",
        "createdAt",
        "updatedAt",
      ]),
      // computed fields
      purposeText: this.record.purpose?.purpose ?? "",
      finalDestination:
        this.lastStop?.location &&
        pick(this.lastStop?.location, ["id", "city", "province", "createdAt", "updatedAt"]),
      departingAt: this.firstStop?.departureAt?.toISOString(),
      returningAt: this.lastStop?.departureAt?.toISOString(),
      phase: this.determinePhase(),
      action: this.determineAction(),
      firstName: this.traveller.firstName,
      lastName: this.traveller.lastName,
      department: this.traveller.department,
      branch: this.traveller.branch,
      isTravelling: this.isTravelling(),
      ...stateFlagsAttributes,
    }
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
    if (isNil(this.firstStop) || isNil(this.firstStop.departureAt)) {
      return false
    }

    if (this.currentDate < this.firstStop.departureAt) {
      return true
    }

    return false
  }

  private isTravelling() {
    if (!this.isApproved()) return false
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
    if (isNil(this.lastStop) || isNil(this.lastStop.departureAt)) {
      return false
    }

    if (this.currentDate > this.lastStop.departureAt) {
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
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.AIRCRAFT)
  }

  private anyTransportTypeIsPoolVehicle() {
    return this.record.stops?.some((stop) => stop.transport === Stop.TravelMethods.POOL_VEHICLE)
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
    return this.record.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.DRAFT
  }

  private travelDeskIsOptionsProvided() {
    return (
      this.record.travelDeskTravelRequest?.status ===
      TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
    )
  }

  private travelDeskIsComplete() {
    return this.record.travelDeskTravelRequest?.status === TravelDeskTravelRequest.Statuses.COMPLETE
  }

  private get firstStop(): Stop | undefined {
    return first(this.record.stops)
  }

  private get lastStop(): Stop | undefined {
    return last(this.record.stops)
  }

  private get lastTravelSegment(): TravelSegment | undefined {
    return last(this.record.travelSegments)
  }

  private get currentDate(): Date {
    return new Date()
  }

  private get traveller(): User {
    if (isNil(this.record.user)) {
      throw new Error("TravelAuthorization must include an associated User")
    }

    return this.record.user
  }
}

export default IndexSerializer
