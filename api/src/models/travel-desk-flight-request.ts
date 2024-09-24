import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/**
 * Keep in sync with web/src/api/travel-desk-flight-requests-api.js
 *
 * TODO: standardize (lowercase and underscore) these values
 */
export enum TravelDeskFlightRequestSeatPreferencesTypes {
  WINDOW = "Window",
  AISLE = "Aisle",
  MIDDLE = "Middle",
  NO_PREFERENCE = "No Preference",
}

/**
 * Keep in sync with web/src/api/travel-desk-flight-requests-api.js
 *
 * TODO: standardize (lowercase and underscore) these values
 */
export enum TravelDeskFlightRequestTimePreferences {
  AM = "AM",
  PM = "PM",
}

export class TravelDeskFlightRequest extends Model<
  InferAttributes<TravelDeskFlightRequest>,
  InferCreationAttributes<TravelDeskFlightRequest>
> {
  static readonly SeatPreferencesTypes = TravelDeskFlightRequestSeatPreferencesTypes
  static readonly TimePreferences = TravelDeskFlightRequestTimePreferences

  declare id: CreationOptional<number>
  declare travelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare departLocation: string
  declare arriveLocation: string
  declare datePreference: Date
  declare timePreference: TravelDeskFlightRequestTimePreferences
  declare seatPreference: TravelDeskFlightRequestSeatPreferencesTypes
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Associations
  declare getTravelRequest: BelongsToGetAssociationMixin<TravelDeskTravelRequest>
  declare setTravelRequest: BelongsToSetAssociationMixin<
    TravelDeskTravelRequest,
    TravelDeskTravelRequest["id"]
  >
  declare createTravelRequest: BelongsToCreateAssociationMixin<TravelDeskTravelRequest>

  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  declare static associations: {
    travelRequest: Association<TravelDeskFlightRequest, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      as: "travelRequest",
      foreignKey: "travelRequestId",
    })
  }
}

TravelDeskFlightRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    travelRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelDeskTravelRequest,
        key: "id",
      },
    },
    departLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    arriveLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datePreference: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timePreference: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskFlightRequestTimePreferences)],
          msg: `Time preference must be one of: ${Object.values(
            TravelDeskFlightRequestTimePreferences
          ).join(", ")}`,
        },
      },
    },
    seatPreference: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskFlightRequestSeatPreferencesTypes)],
          msg: `Seat preference must be one of: ${Object.values(
            TravelDeskFlightRequestSeatPreferencesTypes
          ).join(", ")}`,
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
  }
)

export default TravelDeskFlightRequest
