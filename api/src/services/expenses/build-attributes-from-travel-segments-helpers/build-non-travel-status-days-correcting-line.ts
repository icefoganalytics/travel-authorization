import { CreationAttributes } from "@sequelize/core"
import { sortBy, reverse } from "lodash"

import { Expense } from "@/models"
import { type ExpenseTypes } from "@/models/expense"

export function buildNonTravelStatusDaysCorrectingLine({
  expensesAttributes,
  daysOffTravelStatus,
  travelAuthorizationId,
  travelEndAt,
  type,
}: {
  expensesAttributes: CreationAttributes<Expense>[]
  daysOffTravelStatus: number
  travelAuthorizationId: number
  travelEndAt: Date
  type: ExpenseTypes
}): CreationAttributes<Expense> {
  const expensesByDateReversed = reverse(sortBy(expensesAttributes, "date"))

  const accommodationEstimates = expensesByDateReversed.filter(
    (expense) => expense.expenseType === Expense.ExpenseTypes.ACCOMMODATIONS
  )
  let accommodationReduction = 0
  let accommodationReductionDays = 0
  accommodationEstimates.forEach((expense) => {
    if (accommodationReductionDays >= daysOffTravelStatus) {
      return
    }

    accommodationReduction += expense.cost
    accommodationReductionDays += 1
  })

  const perDiemEstimates = expensesByDateReversed.filter(
    (expense) => expense.expenseType === Expense.ExpenseTypes.MEALS_AND_INCIDENTALS
  )
  let perDiemReduction = 0
  let perDiemReductionDays = 0
  perDiemEstimates.forEach((expense) => {
    if (perDiemReductionDays >= daysOffTravelStatus) {
      return
    }

    perDiemReduction += expense.cost
    perDiemReductionDays += 1
  })

  // CONSIDER: moving this to the front-end or a serializer?
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "decimal",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const perDiemReductionFormatted = formatter.format(perDiemReduction)
  const perDiemReductionDetails = `${perDiemReductionDays} day @ non-travel status per diem -${perDiemReductionFormatted}`
  const accommodationReductionFormatted = formatter.format(accommodationReduction)
  const accommodationReductionDetails = `${accommodationReductionDays} day @ non-travel status accommodation -${accommodationReductionFormatted}`

  return {
    type,
    expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
    travelAuthorizationId,
    currency: Expense.CurrencyTypes.CAD,
    description: [perDiemReductionDetails, accommodationReductionDetails].join(" and "),
    cost: -(accommodationReduction + perDiemReduction),
    date: travelEndAt,
  }
}

export default buildNonTravelStatusDaysCorrectingLine
