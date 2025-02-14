import { isNil } from "lodash"

import BasePolicy from "./base-policy"
import TravelAuthorizationsPolicy from "./travel-authorizations-policy"
import { Expense, TravelAuthorization, User } from "@/models"

export class ExpensesPolicy extends BasePolicy<Expense> {
  private travelAuthorization: Expense["travelAuthorization"]
  private travelSegments: TravelAuthorization["travelSegments"]

  constructor(user: User, record: Expense) {
    super(user, record)
    this.travelAuthorization = record.travelAuthorization
    this.travelSegments = this.travelAuthorization?.travelSegments
  }

  show(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true
    if (this.travelAuthorization?.supervisorEmail === this.user.email) return true
    if (this.travelAuthorization?.userId === this.user.id) return true

    return false
  }

  create(): boolean {
    if (this.record.type === Expense.Types.ESTIMATE) {
      if (this.travelAuthorizationPolicy?.update()) return true

      return false
    } else if (this.record.type === Expense.Types.EXPENSE) {
      // state checks, that supersede roles
      // maybe shouldn't be in a policy?
      if (this.travelAuthorization?.status !== TravelAuthorization.Statuses.APPROVED) return false
      if (!this.isAfterTravelStartDate()) return false

      if (this.user.roles.includes(User.Roles.ADMIN)) return true
      if (this.travelAuthorization.supervisorEmail === this.user.email) return true
      if (this.travelAuthorization.userId === this.user.id) return true

      return false
    } else {
      return false
    }
  }

  update(): boolean {
    return this.create()
  }

  destroy(): boolean {
    return this.create()
  }

  permittedAttributes(): string[] {
    return ["description", "date", "cost", "expenseType"]
  }

  permittedAttributesForCreate(): string[] {
    return ["travelAuthorizationId", "type", "currency", ...this.permittedAttributes()]
  }

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy | null {
    if (this.travelAuthorization === undefined) return null

    return new TravelAuthorizationsPolicy(this.user, this.travelAuthorization)
  }

  private isAfterTravelStartDate(): boolean {
    if (this.travelSegments === undefined) return false

    const firstTravelSegment = this.travelSegments[0]
    if (isNil(firstTravelSegment)) return false
    if (isNil(firstTravelSegment.departureOn)) return false

    return new Date(firstTravelSegment.departureOn) < new Date()
  }
}

export default ExpensesPolicy
