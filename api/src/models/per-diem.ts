import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  literal,
  Model,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

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

  declare id: CreationOptional<number>
  declare claimType: ClaimTypes
  declare travelRegion: TravelRegions
  declare amount: number
  declare currency: CurrencyTypes
}

PerDiem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    claimType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(ClaimTypes)],
          msg: `Claim Type must be one of: ${Object.values(ClaimTypes).join(", ")}`,
        },
      },
    },
    travelRegion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelRegions)],
          msg: `Travel Region must be one of: ${Object.values(TravelRegions).join(", ")}`,
        },
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["claimType", "travelRegion", "currency"],
        name: "per_diems_claim_type_travel_region_currency_unique",
        where: {
          deletedAt: null,
        },
      },
    ],
    scopes: {
      travelRegionDistanceOrder() {
        const customRegionBasedOrder = /* sql */ `
          CASE
            WHEN travel_region = '${TravelRegions.YUKON}' THEN 1
            WHEN travel_region = '${TravelRegions.ALASKA}' THEN 2
            WHEN travel_region = '${TravelRegions.NWT}' THEN 3
            WHEN travel_region = '${TravelRegions.NUNAVUT}' THEN 4
            WHEN travel_region = '${TravelRegions.CANADA}' THEN 5
            WHEN travel_region = '${TravelRegions.US}' THEN 6
            ELSE 7
          END
        `
        return {
          attributes: {
            include: [[literal(customRegionBasedOrder), "travelRegionDistanceOrder"]],
          },
        }
      },
      claimTypeTimeOrder() {
        const customTimeBasedOrder = /* sql */ `
          CASE
            WHEN claim_type = '${ClaimTypes.BREAKFAST}' THEN 1
            WHEN claim_type = '${ClaimTypes.LUNCH}' THEN 2
            WHEN claim_type = '${ClaimTypes.DINNER}' THEN 3
            ELSE 4
          END
        `
        return {
          attributes: {
            include: [[literal(customTimeBasedOrder), "claimTypeTimeOrder"]],
          },
        }
      },
    },
  }
)

export default PerDiem
