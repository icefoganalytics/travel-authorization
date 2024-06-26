import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize"

import sequelize from "@/db/db-client"

export enum ClaimTypes {
  BREAKFAST = "Breakfast",
  LUNCH = "Lunch",
  DINNER = "Dinner",
  INCIDENTALS = "Incidentals",
  PRIVATE_ACCOMMODATIONS = "Private Accommodations",
}

export enum LocationTypes {
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
  static LocationTypes = LocationTypes
  static CurrencyTypes = CurrencyTypes

  declare id: CreationOptional<number>
  declare claim: ClaimTypes | null
  declare location: LocationTypes | null
  declare amount: number | null
  declare currency: CurrencyTypes | null
}

PerDiem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    claim: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // TODO: convert this column to a foreign key to the "locations" table,
    // or use an external api to get this data.
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PerDiem",
    tableName: "perDiems",
    underscored: false,
    timestamps: false,
    paranoid: false,
  }
)

export default PerDiem
