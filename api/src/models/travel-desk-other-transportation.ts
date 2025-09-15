import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/**
 * Keep in sync with web/src/api/travel-desk-other-transportations-api.js
 * TODO: normalizes these to snake_case
 */
export enum TravelDeskOtherTransportationStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/**
 * Keep in sync with web/src/api/travel-desk-other-transportations-api.js
 * TODO: normalizes these to snake_case
 */
export enum TransportationTypes {
  SHUTTLE = "Shuttle",
  BUS = "Bus",
  TRAIN = "Train",
}

export class TravelDeskOtherTransportation extends Model<
  InferAttributes<TravelDeskOtherTransportation>,
  InferCreationAttributes<TravelDeskOtherTransportation>
> {
  static readonly Statuses = TravelDeskOtherTransportationStatuses
  static readonly TransportationTypes = TransportationTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare depart: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare arrive: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TransportationTypes)],
      msg: `Transportation type must be one of the following: ${Object.values(
        TransportationTypes
      ).join(", ")}`,
    },
  })
  declare transportationType: string

  @Attribute(DataTypes.DATEONLY)
  @NotNull
  declare date: Date | string // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.STRING(255))
  declare additionalNotes: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskOtherTransportationStatuses)],
      msg: `Status must be one of the following: ${Object.values(
        TravelDeskOtherTransportationStatuses
      ).join(", ")}`,
    },
  })
  declare status: string

  // NOTE: reserved_transportation_info, and booking do not appear to be used in the codebase.
  @Attribute(DataTypes.STRING(255))
  declare reservedTransportationInfo: string | null

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

  // Associations
  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: "travelRequestId",
    inverse: {
      as: "otherTransportations",
      type: "hasMany",
    },
  })
  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  static establishScopes() {
    // add as needed
  }
}

export default TravelDeskOtherTransportation
