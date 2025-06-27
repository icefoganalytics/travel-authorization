import {
  Association,
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "@sequelize/core"

import sequelize from "@/db/db-client"
import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

export class TravelDeskTravelAgency extends Model<
  InferAttributes<TravelDeskTravelAgency>,
  InferCreationAttributes<TravelDeskTravelAgency>
> {
  declare id: CreationOptional<number>
  declare agencyName: string
  declare contactName: string | null
  declare contactEmail: string | null
  declare contactPhoneNumber: string | null
  declare agencyInfo: string | null

  // Associations
  declare travelRequest?: NonAttribute<TravelDeskTravelRequest>

  declare static associations: {
    travelRequest: Association<TravelDeskTravelAgency, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.hasOne(TravelDeskTravelRequest, {
      as: "travelRequest",
      foreignKey: "travelAgencyId",
    })
  }
}

TravelDeskTravelAgency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    agencyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    agencyInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    paranoid: false,
  }
)

export default TravelDeskTravelAgency
