import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Op,
  sql,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  HasMany,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelDeskFlightOption from "@/models/travel-desk-flight-option"
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

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare departLocation: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare arriveLocation: string

  @Attribute(DataTypes.DATE)
  @NotNull
  declare datePreference: Date

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskFlightRequestTimePreferences)],
      msg: `Time preference must be one of: ${Object.values(
        TravelDeskFlightRequestTimePreferences
      ).join(", ")}`,
    },
  })
  declare timePreference: TravelDeskFlightRequestTimePreferences

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskFlightRequestSeatPreferencesTypes)],
      msg: `Seat preference must be one of: ${Object.values(
        TravelDeskFlightRequestSeatPreferencesTypes
      ).join(", ")}`,
    },
  })
  declare seatPreference: TravelDeskFlightRequestSeatPreferencesTypes

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: CreationOptional<Date | null>

  // Associations
  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: "travelRequestId",
    inverse: {
      as: "flightRequests",
      type: "hasMany",
    },
  })
  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  @HasMany(() => TravelDeskFlightOption, {
    foreignKey: "flightRequestId",
    inverse: "flightRequest",
  })
  declare flightOptions: NonAttribute<TravelDeskFlightOption[]>

  static establishScopes(): void {
    this.addScope("familyOf", (flightRequestId: number) => {
      const travelRequestIdQuery = sql`
        (
          SELECT
            "travel_request_id"
          FROM
            "travel_desk_flight_requests"
          WHERE
            "id" = :flightRequestId
        )
      `
      return {
        where: {
          travelRequestId: {
            [Op.eq]: travelRequestIdQuery,
          },
        },
        replacements: {
          flightRequestId,
        },
      }
    })
  }
}

export default TravelDeskFlightRequest
