import { CreationAttributes } from "@sequelize/core"
import { isNull, minBy } from "lodash"

import logger from "@/utils/logger"
import { Expense, Stop, TravelAuthorization } from "@/models"
import ExpensesService from "./expenses-service"
import StopsService from "./stops-service"

type LegacyFormInput = CreationAttributes<TravelAuthorization> & {
  stops: CreationAttributes<Stop>[]
  expenses: CreationAttributes<Expense>[]
  estimates: CreationAttributes<Expense>[]
  departureDate?: string
}

// DEPRECATED: superseded by the TravelAuthorizationsService
export class FormService {
  //returns form
  async getForm(slug: string): Promise<TravelAuthorization | undefined> {
    logger.warn(
      "This method is deprecated, and will be removed in a future version. Please use Form.findByPK instead, see FormsController#show"
    )
    try {
      const form = await TravelAuthorization.findOne({
        where: { slug },
        include: ["stops"],
      })

      if (isNull(form)) {
        return undefined
      }

      const expenses = await this.getExpenses(form.id)
      const estimates = await this.getEstimates(form.id)

      Object.assign(form, { estimates })
      form.expenses = expenses

      const { stops } = form
      const earliestStop = minBy(stops, "departureDate")
      Object.assign(form, { departureDate: earliestStop?.departureDate })

      return form
    } catch (error: unknown) {
      logger.info(error)
      return undefined
    }
  }

  async saveForm(userId: number, form: LegacyFormInput): Promise<boolean> {
    logger.warn(
      "This method is deprecated, and will be removed in a future version. Please use FormsService#update instead."
    )
    try {
      const stops = form.stops
      const expenses = form.expenses
      const estimates = form.estimates

      delete (form as Partial<LegacyFormInput>).stops
      delete (form as Partial<LegacyFormInput>).expenses
      delete (form as Partial<LegacyFormInput>).estimates
      delete form.departureDate

      form.userId = userId
      form.status = TravelAuthorization.Statuses.DRAFT

      logger.info(form)

      const [returnedForm] = await TravelAuthorization.upsert(form, {
        conflictFields: ["slug"],
      })
      const id = returnedForm.id

      await StopsService.bulkReplace(id, stops)
      await this.saveExpenses(id, expenses)
      await this.saveEstimates(id, estimates)

      return true
    } catch (error: unknown) {
      logger.info(error)
      return false
    }
  }

  async getExpenses(travelAuthorizationId: number): Promise<Expense[] | undefined> {
    try {
      return Expense.findAll({
        where: {
          travelAuthorizationId,
          type: Expense.Types.EXPENSE,
        },
      })
    } catch (error: unknown) {
      logger.info(error)
      return undefined
    }
  }

  async saveExpenses(
    travelAuthorizationId: number,
    expenses: CreationAttributes<Expense>[]
  ): Promise<boolean> {
    try {
      await ExpensesService.bulkReplace(travelAuthorizationId, expenses)
      return true
    } catch (error: unknown) {
      logger.info(error)
      return false
    }
  }

  async getEstimates(travelAuthorizationId: number): Promise<Expense[] | undefined> {
    try {
      return Expense.findAll({
        where: {
          travelAuthorizationId,
          type: Expense.Types.ESTIMATE,
        },
      })
    } catch (error: unknown) {
      logger.info(error)
      return undefined
    }
  }

  async saveEstimates(
    travelAuthorizationId: number,
    estimates: CreationAttributes<Expense>[]
  ): Promise<boolean> {
    logger.warn("DEPRECATED: use saveEstimates instead.")
    return this.saveExpenses(travelAuthorizationId, estimates)
  }

  async submitForm(userId: number, form: LegacyFormInput): Promise<boolean> {
    logger.warn(
      "This method is deprecated, and will be removed in a future version. Please use FormsService#create instead."
    )
    try {
      const stops = form.stops
      delete (form as Partial<LegacyFormInput>).stops

      const expenses = form.expenses
      delete (form as Partial<LegacyFormInput>).expenses

      const estimates = form.estimates
      delete (form as Partial<LegacyFormInput>).estimates

      delete form.departureDate

      form.userId = userId
      form.status = TravelAuthorization.Statuses.SUBMITTED

      const [returnedForm] = await TravelAuthorization.upsert(form, {
        conflictFields: ["slug"],
      })
      const id = returnedForm.id

      await StopsService.bulkReplace(id, stops)
      await this.saveExpenses(id, expenses)
      await this.saveEstimates(id, estimates)
      return true
    } catch (error: unknown) {
      logger.info(error)
      return false
    }
  }
}

export default FormService
