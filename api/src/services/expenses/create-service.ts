import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { Expense, TravelAuthorization } from "@/models"
import BaseService from "@/services/base-service"

export type ExpenseCreationAttributes = Partial<CreationAttributes<Expense>>

export class CreateService extends BaseService {
  constructor(private attributes: ExpenseCreationAttributes) {
    super()
  }

  async perform(): Promise<Expense> {
    const {
      travelAuthorizationId,
      description,
      cost,
      currency,
      type,
      expenseType,
      ...optionalAttributes
    } = this.attributes

    if (isNil(travelAuthorizationId)) {
      throw new Error("Travel authorization ID is required.")
    }

    if (isNil(description)) {
      throw new Error("Description is required.")
    }

    if (isNil(cost)) {
      throw new Error("Cost is required.")
    }

    if (isNil(type)) {
      throw new Error("Type is required.")
    }

    if (isNil(expenseType)) {
      throw new Error("Expense type is required.")
    }

    // TODO: consider separating expense creation by type if complexity increases.
    // e.g. Estimates.CreateService and Expenses.CreateService
    if (type === Expense.Types.EXPENSE) {
      const isAfterTravelStartDate = await this.isAfterTravelStartDate(travelAuthorizationId)
      if (!isAfterTravelStartDate) {
        throw new Error("Can only create expenses after travel has started.")
      }
    }

    const currencyOrDefault = currency ?? Expense.CurrencyTypes.CAD

    const expense = await Expense.create({
      ...optionalAttributes,
      travelAuthorizationId,
      description,
      cost,
      currency: currencyOrDefault,
      type,
      expenseType,
    })
    return expense.reload({
      include: ["receipt"],
    })
  }

  private async isAfterTravelStartDate(travelAuthorizationId: number): Promise<boolean> {
    const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
      include: ["travelSegments"],
      order: [["travelSegments", "segmentNumber", "ASC"]],
      rejectOnEmpty: true,
    })

    const { travelSegments } = travelAuthorization
    if (isNil(travelSegments) || isEmpty(travelSegments)) {
      throw new Error(
        "Travel authorization must have travel segments to check expense creation conditions."
      )
    }

    const firstTravelSegment = travelSegments[0]
    if (isNil(firstTravelSegment)) return false
    if (isNil(firstTravelSegment.departureOn)) return false

    return new Date(firstTravelSegment.departureOn) < new Date()
  }
}
