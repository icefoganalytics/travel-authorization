import FactoryShark, { FactoryParams, GeneratorFn } from "factory-shark"
import { faker } from "@faker-js/faker"

import { Expense, PerDiem, TravelSegment } from "@/models"
import { travelAuthorizationFactory } from "@/factories"

class ExpenseFactory extends FactoryShark<Expense> {
  constructor(generator: GeneratorFn<Expense>) {
    super(Expense, generator, {})
  }

  estimate(params: Pick<FactoryParams<Expense>, "expenseType">) {
    let description: string
    const expenseType = params.expenseType || faker.helpers.enumValue(Expense.ExpenseTypes)
    if (expenseType === Expense.ExpenseTypes.ACCOMMODATIONS) {
      const accommodationType = faker.helpers.enumValue(TravelSegment.AccommodationTypes)
      const city = faker.location.city()
      description = `${accommodationType} in ${city}`
    } else if (expenseType === Expense.ExpenseTypes.MEALS_AND_INCIDENTALS) {
      const claims = faker.helpers.arrayElements(Object.values(PerDiem.ClaimTypes))
      description = claims.join("/")
    } else if (expenseType === Expense.ExpenseTypes.TRANSPORTATION) {
      const modeOfTransport = faker.helpers.enumValue(TravelSegment.TravelMethods)
      const departureCity = faker.location.city()
      const arrivalCity = faker.location.city()
      description = `${modeOfTransport} from ${departureCity} to ${arrivalCity}`
    } else {
      description = faker.lorem.sentence({ min: 3, max: 6 })
    }

    return this.params({
      type: Expense.Types.ESTIMATE,
      description,
      expenseType,
    })
  }
}

export const expenseFactory = new ExpenseFactory(({ associate }) => {
  associate("travelAuthorization", travelAuthorizationFactory)

  return {
    type: faker.helpers.enumValue(Expense.Types),
    currency: Expense.CurrencyTypes.CAD,
    expenseType: faker.helpers.enumValue(Expense.ExpenseTypes),
    description: faker.lorem.sentence({ min: 3, max: 6 }),
    cost: parseFloat(faker.finance.amount({ min: 17.3, max: 500 })),
    date: faker.date.soon({ days: 30 }),
  }
})

export default expenseFactory
