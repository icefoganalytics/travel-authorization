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
  ModelValidator,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil } from "lodash"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/**
 * Keep in sync with web/src/api/travel-desk-hotels-api.js
 * TODO: normalizes these to snake_case
 */
export enum TravelDeskHotelStatuses {
  REQUESTED = "Requested",
  // TODO: confirm this is correct.
  RESERVED = "Reserved", // Uncofirmed, but seems likely.
}

export class TravelDeskHotel extends Model<
  InferAttributes<TravelDeskHotel>,
  InferCreationAttributes<TravelDeskHotel>
> {
  static readonly Statuses = TravelDeskHotelStatuses

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare city: string

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare isDedicatedConferenceHotelAvailable: boolean

  @Attribute(DataTypes.STRING(255))
  declare conferenceName: string | null

  @Attribute(DataTypes.STRING(255))
  declare conferenceHotelName: string | null

  @Attribute(DataTypes.DATEONLY)
  declare checkIn: Date | string // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.DATEONLY)
  declare checkOut: Date | string // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.STRING(255))
  declare additionalInformation: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskHotelStatuses)],
      msg: `Status must be one of the following: ${Object.values(TravelDeskHotelStatuses).join(
        ", "
      )}`,
    },
  })
  declare status: string

  @Attribute(DataTypes.STRING(255))
  declare reservedHotelInfo: string | null

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
  isDedicatedConferenceHotelAvailableAndConferenceNameAndHotelNameContinuity() {
    if (
      this.isDedicatedConferenceHotelAvailable &&
      (isNil(this.conferenceName) ||
        isEmpty(this.conferenceName) ||
        isNil(this.conferenceHotelName) ||
        isEmpty(this.conferenceHotelName))
    ) {
      throw new Error(
        "if isDedicatedConferenceHotelAvailable is true, then conferenceName and conferenceHotelName must be provided"
      )
    } else if (
      this.isDedicatedConferenceHotelAvailable === false &&
      (!isNil(this.conferenceName) ||
        !isEmpty(this.conferenceName) ||
        !isNil(this.conferenceHotelName) ||
        !isEmpty(this.conferenceHotelName))
    ) {
      throw new Error(
        "if isDedicatedConferenceHotelAvailable is false, then conferenceName and conferenceHotelName must not be provided"
      )
    }
  }

  // Associations
  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: "travelRequestId",
    inverse: {
      as: "hotels",
      type: "hasMany",
    },
  })
  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  static establishScopes(): void {
    // add as needed
  }
}

export default TravelDeskHotel
