import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  sql,
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

import { PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex } from "@/models/indexes"

export enum ClaimTypes {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  INCIDENTALS = "incidentals",
  PRIVATE_ACCOMMODATIONS = "private_accommodations",
}

export enum TravelRegions {
  US = "US",
  YUKON = "Yukon",
  NWT = "NWT",
  CANADA = "Canada",
  NUNAVUT = "Nunavut",
  ALASKA = "Alaska",
}

export enum CurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

export class PerDiem extends Model<InferAttributes<PerDiem>, InferCreationAttributes<PerDiem>> {
  static ClaimTypes = ClaimTypes
  static TravelRegions = TravelRegions
  static CurrencyTypes = CurrencyTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex
  @ValidateAttribute({
    isIn: {
      args: [Object.values(ClaimTypes)],
      msg: `Claim Type must be one of: ${Object.values(ClaimTypes).join(", ")}`,
    },
  })
  declare claimType: ClaimTypes

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelRegions)],
      msg: `Travel Region must be one of: ${Object.values(TravelRegions).join(", ")}`,
    },
  })
  declare travelRegion: TravelRegions

  // TODO: convert this type to DECIMAL(10, 4)
  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare amount: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex
  @ValidateAttribute({
    isIn: {
      args: [Object.values(CurrencyTypes)],
      msg: `Currency must be one of: ${Object.values(CurrencyTypes).join(", ")}`,
    },
  })
  declare currency: CurrencyTypes

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null

  static establishScopes(): void {
    this.addScope("travelRegionDistanceOrder", () => {
      const customRegionBasedOrder = sql`
        CASE
          WHEN travel_region = ${TravelRegions.YUKON} THEN 1
          WHEN travel_region = ${TravelRegions.ALASKA} THEN 2
          WHEN travel_region = ${TravelRegions.NWT} THEN 3
          WHEN travel_region = ${TravelRegions.NUNAVUT} THEN 4
          WHEN travel_region = ${TravelRegions.CANADA} THEN 5
          WHEN travel_region = ${TravelRegions.US} THEN 6
          ELSE 7
        END
      `
      return {
        attributes: {
          include: [[customRegionBasedOrder, "travelRegionDistanceOrder"]],
        },
      }
    })
    this.addScope("claimTypeTimeOrder", () => {
      const customTimeBasedOrder = sql`
        CASE
          WHEN claim_type = ${ClaimTypes.BREAKFAST} THEN 1
          WHEN claim_type = ${ClaimTypes.LUNCH} THEN 2
          WHEN claim_type = ${ClaimTypes.DINNER} THEN 3
          ELSE 4
        END
      `
      return {
        attributes: {
          include: [[customTimeBasedOrder, "claimTypeTimeOrder"]],
        },
      }
    })
  }
}

export default PerDiem
