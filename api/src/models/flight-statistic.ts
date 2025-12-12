import {
  DataTypes,
  Op,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type WhereOptions,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"
import { isEmpty } from "lodash"

import BaseModel from "@/models/base-model"

const YUKON_ACRONYM = "YT"
const CANADIAN_PROVINCE_ACRONYMS = Object.freeze([
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  YUKON_ACRONYM,
])

export class FlightStatistic extends BaseModel<
  InferAttributes<FlightStatistic>,
  InferCreationAttributes<FlightStatistic>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  /** Multiple mail codes may map to the same department. */
  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare departmentMailcode: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare destinationAirportCode: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare destinationCity: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare destinationProvince: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare totalTrips: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare totalRoundTrips: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare totalDays: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare totalExpenses: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare totalFlightCost: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare totalRoundTripCost: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare averageDurationDays: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare averageExpensesPerDay: number

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare averageRoundTripFlightCost: number

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null

  static establishScopes(): void {
    this.addScope("byDepartmentMailcodes", (departmentMailcodes: string[]) => {
      return {
        where: {
          departmentMailcode: departmentMailcodes,
        },
      }
    })

    this.addScope("byYukonDestinationCities", (cities: string[]) => {
      return {
        where: {
          destinationCity: cities,
          destinationProvince: YUKON_ACRONYM,
        },
      }
    })

    this.addScope("byCanadianDestinationProvinces", (provinces: string[]) => {
      return {
        where: {
          [Op.and]: [
            {
              destinationProvince: provinces,
            },
            {
              destinationProvince: CANADIAN_PROVINCE_ACRONYMS,
            },
          ],
        },
      }
    })

    this.addScope("byInternationalDestinationProvinces", (provinces: string[]) => {
      return {
        where: {
          [Op.and]: [
            {
              destinationProvince: provinces,
            },
            {
              destinationProvince: {
                [Op.notIn]: CANADIAN_PROVINCE_ACRONYMS,
              },
            },
          ],
        },
      }
    })

    this.addScope(
      "byLocations",
      (options: {
        byYukonDestinationCities?: string[]
        byCanadianDestinationProvinces?: string[]
        byInternationalDestinationProvinces?: string[]
      }) => {
        const conditions: WhereOptions<FlightStatistic>[] = []

        const {
          byYukonDestinationCities,
          byCanadianDestinationProvinces,
          byInternationalDestinationProvinces,
        } = options
        if (!isEmpty(byYukonDestinationCities)) {
          conditions.push({
            destinationCity: byYukonDestinationCities,
            destinationProvince: YUKON_ACRONYM,
          })
        }

        if (!isEmpty(byCanadianDestinationProvinces)) {
          conditions.push({
            [Op.and]: [
              {
                destinationProvince: byCanadianDestinationProvinces,
              },
              {
                destinationProvince: CANADIAN_PROVINCE_ACRONYMS,
              },
            ],
          })
        }

        if (!isEmpty(byInternationalDestinationProvinces)) {
          conditions.push({
            [Op.and]: [
              {
                destinationProvince: byInternationalDestinationProvinces,
              },
              {
                destinationProvince: {
                  [Op.notIn]: CANADIAN_PROVINCE_ACRONYMS,
                },
              },
            ],
          })
        }

        if (isEmpty(conditions)) {
          throw new Error("At least one condition is required")
        }

        return {
          where: {
            [Op.or]: conditions,
          },
        }
      }
    )
  }
}

export default FlightStatistic
