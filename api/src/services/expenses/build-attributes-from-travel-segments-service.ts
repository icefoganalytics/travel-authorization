import { clone, isEmpty, isNil, min, startCase, times, toLower } from "lodash"
import { CreationAttributes, Op } from "@sequelize/core"

import {
  DistanceMatrix,
  Expense,
  Location,
  PerDiem,
  Stop,
  TravelAllowance,
  TravelSegment,
} from "@/models"
import { ExpenseTypes } from "@/models/expense"

import BaseService from "@/services/base-service"
import { BuildAttributesFromTravelSegmentsHelpers } from "@/services/expenses"
import { ClaimTypes, TravelRegions } from "@/models/per-diem"

export class BuildAttributesFromTravelSegmentsService extends BaseService {
  private aircraftAllowanceRemaining = 0
  private aircraftAllowancePerSegment = 0
  private distanceAllowancePerKilometer = 0
  private hotelAllowancePerNight = 0
  private privateAccommodationAllowancePerNight = 0

  constructor(
    protected travelAuthorizationId: number,
    protected travelSegments: TravelSegment[],
    protected daysOffTravelStatus: number,
    protected type: ExpenseTypes
  ) {
    super()
  }

  async perform(): Promise<CreationAttributes<Expense>[]> {
    await this.initializeAircraftAllowanceRemaining()
    await this.initializeAircraftAllowancePerSegment()
    await this.initializeDistanceAllowancePerKilometer()
    await this.initializeHotelAllowancePerNight()
    await this.initializePrivateAccommodationAllowancePerNight()

    const expensesAttributes: CreationAttributes<Expense>[] = []
    let index = 0
    for (const travelSegment of this.travelSegments) {
      if (isNil(travelSegment.departureLocation)) {
        throw new Error(`Missing departure location on TravelSegment#${travelSegment.id}`)
      }
      if (isNil(travelSegment.arrivalLocation)) {
        throw new Error(`Missing arrival location on TravelSegment#${travelSegment.id}`)
      }
      if (isNil(travelSegment.modeOfTransport)) {
        throw new Error(`Missing mode of transport on TravelSegment#${travelSegment.id}`)
      }
      if (isNil(travelSegment.departureOn) || isNil(travelSegment.departureAt)) {
        throw new Error(`Missing departure date on TravelSegment#${travelSegment.id}`)
      }

      const travelMethodExpense = await this.buildTravelMethodExpense({
        type: this.type,
        modeOfTransport: travelSegment.modeOfTransport,
        departureCity: travelSegment.departureLocation.city,
        arrivalCity: travelSegment.arrivalLocation.city,
        departureAt: travelSegment.departureAt,
      })
      expensesAttributes.push(travelMethodExpense)

      const accommodationType = travelSegment.accommodationType
      const nextTravelSegment = this.travelSegments[index + 1]
      if (!isNil(accommodationType) && !isNil(nextTravelSegment)) {
        const accommodationDepartureAt = nextTravelSegment.departureAt
        if (isNil(accommodationDepartureAt)) {
          throw new Error(`Missing departure date on TravelSegment#${nextTravelSegment.id}`)
        }

        const accommodationExpenses = this.buildAccommodationExpenses({
          type: this.type,
          location: travelSegment.arrivalLocation,
          accommodationType,
          arrivalAt: travelSegment.departureAt,
          departureAt: accommodationDepartureAt,
        })
        expensesAttributes.push(...accommodationExpenses)
      }

      index += 1
    }

    const mealsAndIncidentalsExpenses = await this.buildMealsAndIncidentalsExpenses()
    expensesAttributes.push(...mealsAndIncidentalsExpenses)

    if (this.daysOffTravelStatus > 0) {
      if (isNil(this.lastTravelSegment.departureAt)) {
        throw new Error(`Missing departure date on TravelSegment#${this.lastTravelSegment.id}`)
      }
      const nonTravelStatusDaysCorrectingLine =
        BuildAttributesFromTravelSegmentsHelpers.buildNonTravelStatusDaysCorrectingLine({
          expensesAttributes,
          daysOffTravelStatus: this.daysOffTravelStatus,
          travelAuthorizationId: this.travelAuthorizationId,
          travelEndAt: this.lastTravelSegment.departureAt,
          type: this.type,
        })
      expensesAttributes.push(nonTravelStatusDaysCorrectingLine)
    }

    return expensesAttributes
  }

  private async buildTravelMethodExpense({
    type,
    modeOfTransport,
    departureCity,
    arrivalCity,
    departureAt,
  }: {
    type: ExpenseTypes
    modeOfTransport: string
    departureCity: string
    arrivalCity: string
    departureAt: Date
  }): Promise<CreationAttributes<Expense>> {
    const description = `${modeOfTransport} from ${departureCity} to ${arrivalCity}`

    const cost = await this.determineTravelMethodCost(modeOfTransport, departureCity, arrivalCity)

    return {
      type,
      travelAuthorizationId: this.travelAuthorizationId,
      currency: Expense.CurrencyTypes.CAD,
      expenseType: Expense.ExpenseTypes.TRANSPORTATION,
      description,
      cost,
      date: departureAt,
    }
  }

  private buildAccommodationExpenses({
    type,
    location,
    accommodationType,
    arrivalAt,
    departureAt,
  }: {
    type: ExpenseTypes
    location: Location
    accommodationType: string
    arrivalAt: Date
    departureAt: Date
  }): CreationAttributes<Expense>[] {
    const city = location.city
    const description = `${accommodationType} in ${city}`

    const numberOfNights = BuildAttributesFromTravelSegmentsHelpers.calculateNumberOfNights(
      arrivalAt,
      departureAt
    )
    return times(numberOfNights, (index) => {
      const stayedAt = clone(arrivalAt)
      stayedAt.setDate(arrivalAt.getDate() + index)

      const cost = this.determineAccommodationCost(accommodationType)
      return {
        type,
        travelAuthorizationId: this.travelAuthorizationId,
        currency: Expense.CurrencyTypes.CAD,
        expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        description,
        cost,
        date: stayedAt,
      }
    })
  }

  private async buildMealsAndIncidentalsExpenses(): Promise<CreationAttributes<Expense>[]> {
    const travelStartAt = this.firstTravelSegment.departureAtWithTimeFallback(
      TravelSegment.FallbackTimes.BEGINNING_OF_DAY
    )
    const travelEndAt = this.lastTravelSegment.departureAtWithTimeFallback(
      TravelSegment.FallbackTimes.END_OF_DAY
    )
    if (isNil(travelStartAt)) {
      throw new Error(`Missing departure date on TravelSegment#${this.firstTravelSegment.id}`)
    }
    if (isNil(travelEndAt)) {
      throw new Error(`Missing departure date on TravelSegment#${this.lastTravelSegment.id}`)
    }

    const claimsPerDay = BuildAttributesFromTravelSegmentsHelpers.determineClaimsPerDay(
      travelStartAt,
      travelEndAt
    )

    const expenses = []
    for (const { date, claims } of claimsPerDay) {
      if (isEmpty(claims)) {
        continue
      }

      const location = BuildAttributesFromTravelSegmentsHelpers.determineFinalDestination(
        this.travelSegments
      )
      const province = location.province
      // TODO: consider using i18n to convert claim types to human readable strings
      const description = claims.map((claim) => startCase(toLower(claim))).join("/")
      const cost = await this.determinePerDiemCost(province, claims)
      if (isNil(cost)) {
        throw new Error(`Missing per diem cost for province=${province} and claims=${claims}`)
      }

      expenses.push({
        type: this.type,
        travelAuthorizationId: this.travelAuthorizationId,
        currency: Expense.CurrencyTypes.CAD,
        expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        description,
        cost,
        date,
      })
    }

    return expenses
  }

  private async determineTravelMethodCost(
    travelMethod: string,
    fromCity: string,
    toCity: string
  ): Promise<number> {
    switch (travelMethod) {
      case Stop.TravelMethods.AIRCRAFT:
        return this.determineAicraftAllowance()
      case Stop.TravelMethods.PERSONAL_VEHICLE:
        return this.determinePersonalVehicleAllowance(fromCity, toCity)
      case Stop.TravelMethods.POOL_VEHICLE:
      case Stop.TravelMethods.RENTAL_VEHICLE:
        return 0
      default:
        return 0
    }
  }

  private determineAicraftAllowance(): number {
    const allowance = min([
      this.aircraftAllowanceRemaining,
      this.aircraftAllowancePerSegment,
    ]) as number
    this.aircraftAllowanceRemaining -= allowance
    return allowance
  }

  private async determinePersonalVehicleAllowance(
    fromCity: string,
    toCity: string
  ): Promise<number> {
    const distanceMatrix = await DistanceMatrix.findOne({
      where: {
        [Op.or]: [
          { origin: fromCity, destination: toCity },
          { origin: toCity, destination: fromCity },
        ],
      },
    })
    if (isNil(distanceMatrix) || isNil(distanceMatrix.kilometers)) return 0

    const { kilometers } = distanceMatrix
    return kilometers * this.distanceAllowancePerKilometer
  }

  private determineAccommodationCost(accommodationType: string): number {
    switch (accommodationType) {
      case Stop.AccommodationTypes.HOTEL:
        return 1 * this.hotelAllowancePerNight
      // TODO: determine if Private Accommodation is part of the max daily per-diem
      case Stop.AccommodationTypes.PRIVATE:
        return 1 * this.privateAccommodationAllowancePerNight
      default:
        return 0
    }
  }

  private async determinePerDiemCost(province: string, claimTypes: ClaimTypes[]): Promise<number> {
    const travelRegion = this.determineTravelRegionFromProvince(province)

    const sum = await PerDiem.sum("amount", {
      where: {
        claimType: { [Op.in]: claimTypes },
        travelRegion,
      },
    })
    if (isNil(sum)) return 0

    return sum
  }

  private determineTravelRegionFromProvince(province: string): TravelRegions {
    switch (province) {
      case "YT":
        return PerDiem.TravelRegions.YUKON
      case "NT":
        return PerDiem.TravelRegions.NWT
      case "NU":
        return PerDiem.TravelRegions.NUNAVUT
      // TODO: Handle Alaska and the US in the future
      // I don't see any destination data for this yet, so leaving for now.
      default:
        return PerDiem.TravelRegions.CANADA
    }
  }

  private async initializeAircraftAllowanceRemaining(): Promise<void> {
    const maxiumAircraftAllowance = await TravelAllowance.findOne({
      where: {
        allowanceType: TravelAllowance.AllowanceTypes.MAXIUM_AIRCRAFT_ALLOWANCE,
        currency: TravelAllowance.CurrencyTypes.CAD,
      },
    })
    if (isNil(maxiumAircraftAllowance)) {
      throw new Error("Missing maximum aircraft allowance")
    }
    this.aircraftAllowanceRemaining = maxiumAircraftAllowance.amount
  }

  private async initializeAircraftAllowancePerSegment(): Promise<void> {
    const aircraftAllowancePerSegment = await TravelAllowance.findOne({
      where: {
        allowanceType: TravelAllowance.AllowanceTypes.AIRCRAFT_ALLOWANCE_PER_SEGMENT,
        currency: TravelAllowance.CurrencyTypes.CAD,
      },
    })
    if (isNil(aircraftAllowancePerSegment)) {
      throw new Error("Missing aircraft allowance per segment")
    }
    this.aircraftAllowancePerSegment = aircraftAllowancePerSegment.amount
  }

  private async initializeDistanceAllowancePerKilometer(): Promise<void> {
    const distanceAllowancePerKilometer = await TravelAllowance.findOne({
      where: {
        allowanceType: TravelAllowance.AllowanceTypes.DISTANCE_ALLOWANCE_PER_KILOMETER,
        currency: TravelAllowance.CurrencyTypes.CAD,
      },
    })
    if (isNil(distanceAllowancePerKilometer)) {
      throw new Error("Missing distance allowance per kilometer")
    }
    this.distanceAllowancePerKilometer = distanceAllowancePerKilometer.amount
  }

  private async initializeHotelAllowancePerNight(): Promise<void> {
    const hotelAllowancePerNight = await TravelAllowance.findOne({
      where: {
        allowanceType: TravelAllowance.AllowanceTypes.HOTEL_ALLOWANCE_PER_NIGHT,
        currency: TravelAllowance.CurrencyTypes.CAD,
      },
    })
    if (isNil(hotelAllowancePerNight)) {
      throw new Error("Missing hotel allowance per night")
    }
    this.hotelAllowancePerNight = hotelAllowancePerNight.amount
  }

  private async initializePrivateAccommodationAllowancePerNight(): Promise<void> {
    const privateAccommodationAllowancePerNight = await PerDiem.findOne({
      where: {
        claimType: PerDiem.ClaimTypes.PRIVATE_ACCOMMODATIONS,
        currency: PerDiem.CurrencyTypes.CAD,
      },
    })
    if (isNil(privateAccommodationAllowancePerNight)) {
      throw new Error("Missing private accommodation allowance per night")
    }
    this.privateAccommodationAllowancePerNight = privateAccommodationAllowancePerNight.amount
  }

  private get firstTravelSegment(): TravelSegment {
    const travelSegment = this.travelSegments.at(0)
    if (isNil(travelSegment)) {
      throw new Error("Missing first travel segment")
    }

    return travelSegment
  }

  private get lastTravelSegment(): TravelSegment {
    const travelSegment = this.travelSegments.at(-1)
    if (isNil(travelSegment)) {
      throw new Error("Missing last travel segment")
    }

    return travelSegment
  }
}

export default BuildAttributesFromTravelSegmentsService
