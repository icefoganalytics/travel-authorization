import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import { TravelAllowancesAllowanceTypeCurrencyUniqueIndex } from "@/models/indexes"

export enum AllowanceTypes {
  MAXIUM_AIRCRAFT_ALLOWANCE = "maxium_aircraft_allowance",
  AIRCRAFT_ALLOWANCE_PER_SEGMENT = "aircraft_allowance_per_segment",
  DISTANCE_ALLOWANCE_PER_KILOMETER = "distance_allowance_per_kilometer",
  HOTEL_ALLOWANCE_PER_NIGHT = "hotel_allowance_per_night",
}

export enum CurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

export class TravelAllowance extends Model<
  InferAttributes<TravelAllowance>,
  InferCreationAttributes<TravelAllowance>
> {
  static AllowanceTypes = AllowanceTypes
  static CurrencyTypes = CurrencyTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @TravelAllowancesAllowanceTypeCurrencyUniqueIndex
  @ValidateAttribute({
    isIn: {
      args: [Object.values(AllowanceTypes)],
      msg: `Allowance Type must be one of: ${Object.values(AllowanceTypes).join(", ")}`,
    },
  })
  declare allowanceType: AllowanceTypes

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare amount: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @TravelAllowancesAllowanceTypeCurrencyUniqueIndex
  declare currency: CurrencyTypes

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
    // Scopes can be added here if needed
  }
}

export default TravelAllowance
