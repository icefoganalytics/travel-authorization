import { CreationAttributes } from "sequelize"
import { isEmpty, isNil } from "lodash"

import { Expense, TravelAuthorization, TravelSegment } from "@/models"
import BaseService from "@/services/base-service"

export class PrefillService extends BaseService {
  constructor(
    public travelAuthorizationId: number,
    public estimates: Expense[]
  ) {
    super()
  }

  async perform(): Promise<Expense[]> {
    const travelAuthorization = await this.loadTravelAuthorization()

    if (travelAuthorization.status !== TravelAuthorization.Statuses.APPROVED) {
      throw new Error("Can only prefill expenses for approved travel authorizations.")
    }

    const { travelSegments } = travelAuthorization
    if (isNil(travelSegments) || isEmpty(travelSegments)) {
      throw new Error("Travel authorization must have travel segments to check prefill conditions.")
    }

    if (!this.isAfterTravelStartDate(travelSegments)) {
      throw new Error("Can only prefill expenses after travel start date.")
    }

    const expenses = this.buildExpenses(this.estimates)

    return Expense.bulkCreate(expenses)
  }

  private async loadTravelAuthorization(): Promise<TravelAuthorization> {
    return TravelAuthorization.findByPk(this.travelAuthorizationId, {
      include: ["travelSegments"],
      order: [["travelSegments", "segmentNumber", "ASC"]],
      rejectOnEmpty: true,
    })
  }

  private isAfterTravelStartDate(travelSegments: TravelSegment[]): boolean {
    const firstTravelSegment = travelSegments[0]
    if (isNil(firstTravelSegment)) return false
    if (isNil(firstTravelSegment.departureOn)) return false

    return new Date(firstTravelSegment.departureOn) < new Date()
  }

  // TODO: it might make sense to re-generate the meals and incidentals,
  // rather than cloning them from expenses as they might have been edited by the user.
  private buildExpenses(estimates: Expense[]): CreationAttributes<Expense>[] {
    const expensableEstimates = estimates.filter(
      (estimate) =>
        estimate.expenseType !== Expense.ExpenseTypes.TRANSPORTATION &&
        // TODO: consider linking estimate with travel segment?
        !estimate.description.includes(TravelSegment.TravelMethods.AIRCRAFT)
    )

    const expensesAttributes = expensableEstimates.map((estimate) => {
      const expenseAttributes = {
        travelAuthorizationId: this.travelAuthorizationId,
        description: estimate.description,
        date: estimate.date,
        cost: estimate.cost,
        currency: estimate.currency,
        type: Expense.Types.EXPENSE,
        expenseType: estimate.expenseType,
      }
      return expenseAttributes
    })

    return expensesAttributes
  }
}

export default PrefillService
