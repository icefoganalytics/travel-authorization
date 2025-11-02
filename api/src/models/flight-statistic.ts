import {
  DataTypes,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"

export class FlightStatistic extends BaseModel<
  InferAttributes<FlightStatistic>,
  InferCreationAttributes<FlightStatistic>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare department: string

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
    // Add scopes here if needed in the future
  }
}

export default FlightStatistic
