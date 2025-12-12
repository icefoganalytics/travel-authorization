import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { FlightStatistic } from "@/models"

// Realistic mail codes from the Yukon government
const DEPARTMENT_MAILCODES = [
  "C-19",
  "W-17",
  "CM-4",
  "C-23",
  "L-1MT",
  "Y-1",
  "A-9",
  "2HOSP",
  "WCB",
  "C-9",
  "K-6",
  "E-1",
  "WCB CLT",
  "C-10",
  "K-240",
  "L-1",
  "K-10",
  "J-11",
  "PS-206",
  "W-8",
  "K-918",
  "W-3I",
  "WCB CLMT",
  "J-1",
  "CM-1",
  "W-3C",
  "V-5",
  "F-4",
  "W-2",
  "V-1",
  "H-10",
  "W-13",
  "V-18",
  "2 HOS",
  "A-8",
  "K-320",
  "J-1B",
  "V-5A",
  "A-310",
  "H-109",
  "J-3",
  "F-1",
  "V-8",
  "K-11",
  "CM-6",
  "W-10",
  "K-419",
  "C-3",
  "K-325",
  "K-315",
  "C-8",
  "W-1",
  "J-3E",
  "A-8C",
  "W-5",
  "H-9A",
  "WCB CLAIMA",
  "H-1",
  "W-12ST",
  "B-1",
  "W-12",
  "W-4",
  "WCB-CLMT",
  "Z-1",
] as const

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
    departmentMailcode: faker.helpers.arrayElement(DEPARTMENT_MAILCODES),
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
