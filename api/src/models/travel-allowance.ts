import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

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

  declare id: CreationOptional<number>
  declare allowanceType: AllowanceTypes
  declare amount: number
  declare currency: CurrencyTypes
}

TravelAllowance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    allowanceType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(AllowanceTypes)],
          msg: `Allowance Type must be one of: ${Object.values(AllowanceTypes).join(", ")}`,
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
        fields: ["allowanceType", "currency"],
        name: "travel_allowances_allowance_type_currency_unique",
        where: {
          deletedAt: null,
        },
      },
    ],
  }
)

export default TravelAllowance
