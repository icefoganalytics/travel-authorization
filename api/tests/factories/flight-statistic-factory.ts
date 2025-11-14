import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { FlightStatistic } from "@/models"

export const flightStatisticFactory = Factory.define<FlightStatistic>(({ onCreate }) => {
  onCreate((flightStatistic) => {
    try {
      return flightStatistic.save()
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create FlightStatistic with attributes: ${JSON.stringify(flightStatistic.dataValues, null, 2)}`
      )
    }
  })

  return FlightStatistic.build({
    department: faker.string.alphanumeric(10).toUpperCase(),
    destinationAirportCode: faker.string.alpha(3).toUpperCase(),
    destinationCity: faker.location.city().toUpperCase(),
    destinationProvince: faker.location.state({ abbreviated: true }),
    totalTrips: faker.number.int({ min: 1, max: 100 }),
    totalRoundTrips: faker.number.int({ min: 0, max: 50 }),
    totalDays: faker.number.int({ min: 1, max: 365 }),
    totalExpenses: faker.number.float({ min: 0, max: 10000, precision: 2 }),
    totalFlightCost: faker.number.float({ min: 0, max: 10000, precision: 2 }),
    totalRoundTripCost: faker.number.float({ min: 0, max: 10000, precision: 2 }),
    averageDurationDays: faker.number.float({ min: 1, max: 30, precision: 2 }),
    averageExpensesPerDay: faker.number.float({ min: 0, max: 500, precision: 2 }),
    averageRoundTripFlightCost: faker.number.float({ min: 0, max: 5000, precision: 2 }),
  })
})

export default flightStatisticFactory
