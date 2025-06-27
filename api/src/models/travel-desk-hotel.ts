import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  NonAttribute,
  DataTypes,
} from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import sequelize from "@/db/db-client"

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

  declare id: CreationOptional<number>
  declare travelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare city: string
  declare isDedicatedConferenceHotelAvailable: boolean
  declare conferenceName: string | null
  declare conferenceHotelName: string | null
  declare checkIn: Date | string // DATEONLY accepts Date or string, but returns string
  declare checkOut: Date | string // DATEONLY accepts Date or string, but returns string
  declare additionalInformation: CreationOptional<string | null>
  declare status: string
  declare reservedHotelInfo: CreationOptional<string | null>
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
    travelRequest: Association<TravelDeskHotel, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      as: "travelRequest",
      foreignKey: "travelRequestId",
    })
  }
}

TravelDeskHotel.init(
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
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isDedicatedConferenceHotelAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    conferenceName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    conferenceHotelName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    checkIn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    additionalInformation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskHotelStatuses)],
          msg: `Status must be one of the following: ${Object.values(TravelDeskHotelStatuses).join(
            ", "
          )}`,
        },
      },
    },
    reservedHotelInfo: {
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
    validate: {
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
      },
    },
  }
)

export default TravelDeskHotel
