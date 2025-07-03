import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  ModelValidator,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty } from "lodash"

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

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare pickUpCity: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(LocationTypes)],
      msg: `Pick up location must be one of the following: ${Object.values(LocationTypes).join(
        ","
      )}`,
    },
  })
  declare pickUpLocation: string

  @Attribute(DataTypes.STRING(255))
  declare pickUpLocationOther: string | null

  @Attribute(DataTypes.STRING(255))
  declare dropOffCity: string | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    isIn: {
      args: [Object.values(LocationTypes)],
      msg: `Drop off location must be one of the following: ${Object.values(LocationTypes).join(
        ","
      )}`,
    },
  })
  declare dropOffLocation: string | null

  @Attribute(DataTypes.STRING(255))
  declare dropOffLocationOther: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(true)
  declare sameDropOffLocation: CreationOptional<boolean>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare matchFlightTimes: CreationOptional<boolean>

  @Attribute(DataTypes.STRING(255))
  declare vehicleTypeChangeIndicator: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(VehicleTypes)],
      msg: `Vehicle type must be one of the following: ${Object.values(VehicleTypes).join(", ")}`,
    },
  })
  declare vehicleType: string

  @Attribute(DataTypes.STRING(255))
  declare vehicleChangeRationale: string | null

  /**
   * TODO: standardize to pickUpAt and dropOffAt
   * See https://stackoverflow.com/a/40154656
   * - Name date columns with `_on` suffixes.
   * - Name datetime columns with `_at` suffixes.
   * - Name time columns (referring to a time of day with no date) with `_time` suffixes.
   */
  @Attribute(DataTypes.DATE)
  @NotNull
  declare pickUpDate: Date

  @Attribute(DataTypes.DATE)
  @NotNull
  declare dropOffDate: Date

  @Attribute(DataTypes.STRING(255))
  declare additionalNotes: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskRentalCarStatuses)],
      msg: `Status must be one of the following: ${Object.values(TravelDeskRentalCarStatuses).join(
        ", "
      )}`,
    },
  })
  declare status: string

  @Attribute(DataTypes.STRING(255))
  declare reservedVehicleInfo: string | null

  @Attribute(DataTypes.STRING(255))
  declare booking: string | null

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

  // Validators
  @ModelValidator
  dropOffLocationContinuity() {
    if (this.sameDropOffLocation === true && !isEmpty(this.dropOffLocation)) {
      throw new Error("Drop off location must be empty when same drop off location is true")
    } else if (this.sameDropOffLocation === false && isEmpty(this.dropOffLocation)) {
      throw new Error("Drop off location must be provided when same drop off location is false")
    }
  }

  @ModelValidator
  dropOfLocationOtherContinuity() {
    if (this.dropOffLocation === LocationTypes.OTHER && isEmpty(this.dropOffLocationOther)) {
      throw new Error("Drop off location other must be provided when 'Other' is selected")
    } else if (
      this.dropOffLocation !== LocationTypes.OTHER &&
      !isEmpty(this.dropOffLocationOther)
    ) {
      throw new Error("Drop off location other must be empty when 'Other' is not selected")
    }
  }

  @ModelValidator
  pickUpLocationOtherContinuity() {
    if (this.pickUpLocation === LocationTypes.OTHER && isEmpty(this.pickUpLocationOther)) {
      throw new Error("Pick up location other must be provided when 'Other' is selected")
    } else if (this.pickUpLocation !== LocationTypes.OTHER && !isEmpty(this.pickUpLocationOther)) {
      throw new Error("Pick up location other must be empty when 'Other' is not selected")
    }
  }

  @ModelValidator
  vehicleChangeRationaleContinuity() {
    if (this.vehicleType !== VehicleTypes.COMPACT && isEmpty(this.vehicleChangeRationale)) {
      throw new Error("Vehicle change rationale must be provided when vehicle type is not Compact")
    } else if (this.vehicleType === VehicleTypes.COMPACT && !isEmpty(this.vehicleChangeRationale)) {
      throw new Error("Vehicle change rationale must be empty when vehicle type is Compact")
    }
  }

  // Associations
  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: "travelRequestId",
    inverse: {
      as: "rentalCars",
      type: "hasMany",
    },
  })
  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  static establishScopes(): void {
    // add as needed
  }
}

export default TravelDeskRentalCar
