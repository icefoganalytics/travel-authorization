import { CreationAttributes } from "sequelize"
import { sortBy, reverse } from "lodash"

import { Expense } from "@/models"

export function buildNonTravelStatusDaysCorrectingLine({
  estimates,
  daysOffTravelStatus,
  travelAuthorizationId,
  travelEndAt,
}: {
  estimates: CreationAttributes<Expense>[]
  daysOffTravelStatus: number
  travelAuthorizationId: number
  travelEndAt: Date
}): CreationAttributes<Expense> {
  const estimatesByDateReversed = reverse(sortBy(estimates, "date"))

  const accommodationEstimates = estimatesByDateReversed.filter(
    (estimate) => estimate.expenseType === Expense.ExpenseTypes.ACCOMMODATIONS
  )
  let accommodationReduction = 0
  let accommodationReductionDays = 0
  accommodationEstimates.forEach((estimate) => {
    if (accommodationReductionDays >= daysOffTravelStatus) {
      return
    }

    accommodationReduction += estimate.cost
    accommodationReductionDays += 1
  })

  const perDiemEstimates = estimatesByDateReversed.filter(
    (estimate) => estimate.expenseType === Expense.ExpenseTypes.MEALS_AND_INCIDENTALS
  )
  let perDiemReduction = 0
  let perDiemReductionDays = 0
  perDiemEstimates.forEach((estimate) => {
    if (perDiemReductionDays >= daysOffTravelStatus) {
      return
    }

    perDiemReduction += estimate.cost
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
    type: Expense.Types.ESTIMATE,
    expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
    travelAuthorizationId,
    currency: Expense.CurrencyTypes.CAD,
    description: [perDiemReductionDetails, accommodationReductionDetails].join(" and "),
    cost: -(accommodationReduction + perDiemReduction),
    date: travelEndAt,
  }
}

export default buildNonTravelStatusDaysCorrectingLine
