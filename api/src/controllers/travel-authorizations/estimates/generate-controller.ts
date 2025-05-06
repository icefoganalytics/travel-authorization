import { isNil } from "lodash"

import logger from "@/utils/logger"
import { Expense, TravelAuthorization } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { BulkGenerateService } from "@/services/estimates"
import BaseController from "@/controllers/base-controller"

export class GenerateController extends BaseController {
  async create() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({ message: "Travel authorization not found." })
      }

      const expense = await this.buildExpense(travelAuthorization)
      const policy = this.buildPolicy(expense)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to create this expense." })
      }

      const { travelSegmentEstimates = [] } = travelAuthorization
      const estimates = await BulkGenerateService.perform(
        travelAuthorization.id,
        travelSegmentEstimates,
        {
          daysOffTravelStatus: travelAuthorization.daysOffTravelStatusEstimate || 0,
        }
      )
      return this.response.status(201).json({
        estimates,
        message: "Generated estimates",
      })
    } catch (error) {
      logger.error(`Error generating estimate: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to generate estimate: ${error}`,
      })
    }
  }

  private async loadTravelAuthorization() {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId, {
      include: [
        {
          association: "travelSegmentEstimates",
          include: ["departureLocation", "arrivalLocation"],
        },
      ],
      order: [["travelSegmentEstimates", "segmentNumber", "ASC"]],
    })
  }

  private async buildExpense(travelAuthorization: TravelAuthorization) {
    const expense = Expense.build({
      type: Expense.Types.ESTIMATE,
      description: "Generated estimate",
      cost: 0,
      currency: Expense.CurrencyTypes.CAD,
      expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
    })
    expense.travelAuthorization = travelAuthorization
    return expense
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default GenerateController
