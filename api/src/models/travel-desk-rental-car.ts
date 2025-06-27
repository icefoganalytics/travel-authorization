import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  DataTypes,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  NonAttribute,
} from "@sequelize/core"
import { isEmpty } from "lodash"

import sequelize from "@/db/db-client"
import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/**
 * Keep in sync with web/src/api/travel-desk-rental-cars-api.js
 * TODO: normalize these to snake_case at some point
 */
export enum LocationTypes {
  AIRPORT = "Airport",
  HOTEL = "Hotel",
  DOWNTOWN = "Downtown",
  OTHER = "Other",
}

/**
 * Keep in sync with web/src/api/travel-desk-rental-cars-api.js
 * TODO: normalize these to snake_case at some point
 */
export enum TravelDeskRentalCarStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/**
 * Keep in sync with web/src/api/travel-desk-rental-cars-api.js
 * TODO: normalize these to snake_case at some point
 */
export enum VehicleTypes {
  ECONOMY = "Economy",
  COMPACT = "Compact",
  INTERMEDIATE = "Intermediate",
  STANDARD = "Standard",
  FULL_SIZE = "Full-Size",
  INTERMEDIATE_SUV = "Intermediate SUV",
  LUXURY = "Luxury",
  MINIVAN = "Minivan",
  STANDARD_SUV = "Standard SUV",
  FULL_SIZE_SUV = "Full-Size SUV",
  PICKUP_TRUCK = "Pickup Truck",
}

export class TravelDeskRentalCar extends Model<
  InferAttributes<TravelDeskRentalCar>,
  InferCreationAttributes<TravelDeskRentalCar>
> {
  static readonly LocationTypes = LocationTypes
  static readonly Statuses = TravelDeskRentalCarStatuses
  static readonly VehicleTypes = VehicleTypes

  declare id: CreationOptional<number>
  declare travelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare pickUpCity: string
  declare pickUpLocation: string
  declare pickUpLocationOther: CreationOptional<string | null>
  declare dropOffCity: CreationOptional<string | null>
  declare dropOffLocation: CreationOptional<string | null>
  declare dropOffLocationOther: CreationOptional<string | null>
  declare sameDropOffLocation: CreationOptional<boolean>
  declare matchFlightTimes: CreationOptional<boolean>
  declare vehicleTypeChangeIndicator: CreationOptional<string | null>
  declare vehicleType: string
  declare vehicleChangeRationale: CreationOptional<string | null>
  declare pickUpDate: Date
  declare dropOffDate: Date
  declare additionalNotes: CreationOptional<string | null>
  declare status: string
  declare reservedVehicleInfo: CreationOptional<string | null>
  declare booking: CreationOptional<string | null>
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
    travelRequest: Association<TravelDeskRentalCar, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      as: "travelRequest",
      foreignKey: "travelRequestId",
    })
  }
}

TravelDeskRentalCar.init(
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
    pickUpCity: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pickUpLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(LocationTypes)],
          msg: `Pick up location must be one of the following: ${Object.values(LocationTypes).join(
            ","
          )}`,
        },
      },
    },
    pickUpLocationOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dropOffCity: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dropOffLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(LocationTypes)],
          msg: `Drop off location must be one of the following: ${Object.values(LocationTypes).join(
            ","
          )}`,
        },
      },
    },
    dropOffLocationOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sameDropOffLocation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    matchFlightTimes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    vehicleTypeChangeIndicator: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vehicleType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(VehicleTypes)],
          msg: `Vehicle type must be one of the following: ${Object.values(VehicleTypes).join(
            ", "
          )}`,
        },
      },
    },
    vehicleChangeRationale: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    /**
     * TODO: standardize to pickUpAt and dropOffAt
     * See https://stackoverflow.com/a/40154656
     * - Name date columns with `_on` suffixes.
     * - Name datetime columns with `_at` suffixes.
     * - Name time columns (referring to a time of day with no date) with `_time` suffixes.
     */
    pickUpDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dropOffDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    additionalNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskRentalCarStatuses)],
          msg: `Status must be one of the following: ${Object.values(
            TravelDeskRentalCarStatuses
          ).join(", ")}`,
        },
      },
    },
    reservedVehicleInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    booking: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    },
  },
  {
    sequelize,
    paranoid: false,
    validate: {
      dropOffLocationContinuity() {
        if (this.sameDropOffLocation === true && !isEmpty(this.dropOffLocation)) {
          throw new Error("Drop off location must be empty when same drop off location is true")
        } else if (this.sameDropOffLocation === false && isEmpty(this.dropOffLocation)) {
          throw new Error("Drop off location must be provided when same drop off location is false")
        }
      },
      dropOfLocationOtherContinuity() {
        if (this.dropOffLocation === LocationTypes.OTHER && isEmpty(this.dropOffLocationOther)) {
          throw new Error("Drop off location other must be provided when 'Other' is selected")
        } else if (
          this.dropOffLocation !== LocationTypes.OTHER &&
          !isEmpty(this.dropOffLocationOther)
        ) {
          throw new Error("Drop off location other must be empty when 'Other' is not selected")
        }
      },
      pickUpLocationOtherContinuity() {
        if (this.pickUpLocation === LocationTypes.OTHER && isEmpty(this.pickUpLocationOther)) {
          throw new Error("Pick up location other must be provided when 'Other' is selected")
        } else if (
          this.pickUpLocation !== LocationTypes.OTHER &&
          !isEmpty(this.pickUpLocationOther)
        ) {
          throw new Error("Pick up location other must be empty when 'Other' is not selected")
        }
      },
      vehicleChangeRationaleContinuity() {
        if (this.vehicleType !== VehicleTypes.COMPACT && isEmpty(this.vehicleChangeRationale)) {
          throw new Error(
            "Vehicle change rationale must be provided when vehicle type is not Compact"
          )
        } else if (
          this.vehicleType === VehicleTypes.COMPACT &&
          !isEmpty(this.vehicleChangeRationale)
        ) {
          throw new Error("Vehicle change rationale must be empty when vehicle type is Compact")
        }
      },
    },
  }
)

export default TravelDeskRentalCar
