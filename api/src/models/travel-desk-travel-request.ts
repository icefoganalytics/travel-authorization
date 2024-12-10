import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  literal,
  Model,
  NonAttribute,
} from "sequelize"
import { isNil } from "lodash"
import minify from "pg-minify"

import sequelize from "@/db/db-client"

import TravelAuthorization from "@/models/travel-authorization"
import TravelDeskFlightRequest from "@/models/travel-desk-flight-request"
import TravelDeskHotel from "@/models/travel-desk-hotel"
import TravelDeskOtherTransportation from "@/models/travel-desk-other-transportation"
import TravelDeskPassengerNameRecordDocument from "@/models/travel-desk-passenger-name-record-document"
import TravelDeskQuestion from "@/models/travel-desk-question"
import TravelDeskRentalCar from "@/models/travel-desk-rental-car"
import TravelDeskTravelAgency from "@/models/travel-desk-travel-agency"

/** Keep in sync with web/src/api/travel-desk-travel-requests-api.js */
export enum TravelDeskTravelRequestStatuses {
  BOOKED = "booked",
  COMPLETE = "complete",
  DRAFT = "draft",
  OPTIONS_PROVIDED = "options_provided",
  OPTIONS_RANKED = "options_ranked",
  SUBMITTED = "submitted",
}

export class TravelDeskTravelRequest extends Model<
  InferAttributes<TravelDeskTravelRequest>,
  InferCreationAttributes<TravelDeskTravelRequest>
> {
  static Statuses = TravelDeskTravelRequestStatuses

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare travelAgencyId: ForeignKey<TravelDeskTravelAgency["id"]> | null
  declare legalFirstName: string
  declare legalMiddleName: string | null
  declare legalLastName: string
  declare birthDate: string | null
  declare strAddress: string
  declare city: string
  declare province: string
  declare postalCode: string
  declare isInternationalTravel: CreationOptional<boolean>
  declare passportCountry: string | null
  declare passportNum: string | null
  declare travelPurpose: string
  declare travelLocation: string | null
  declare travelNotes: string | null
  declare busPhone: string
  declare busEmail: string
  declare travelContact: boolean | null
  declare travelPhone: string | null
  declare travelEmail: string | null
  declare additionalInformation: string | null
  declare status: string
  declare travelDeskOfficer: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Associations
  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare travelDeskPassengerNameRecordDocument?: NonAttribute<TravelDeskPassengerNameRecordDocument>
  declare travelAgency?: NonAttribute<TravelDeskTravelAgency>
  declare flightRequests?: NonAttribute<TravelDeskFlightRequest[]>
  declare hotels?: NonAttribute<TravelDeskHotel[]>
  declare otherTransportations?: NonAttribute<TravelDeskOtherTransportation[]>
  declare questions?: NonAttribute<TravelDeskQuestion[]>
  declare rentalCars?: NonAttribute<TravelDeskRentalCar[]>

  declare static associations: {
    flightRequests: Association<TravelDeskTravelRequest, TravelDeskFlightRequest>
    hotels: Association<TravelDeskTravelRequest, TravelDeskHotel>
    rentalCars: Association<TravelDeskTravelRequest, TravelDeskRentalCar>
    travelAuthorization: Association<TravelDeskTravelRequest, TravelAuthorization>
    otherTransportations: Association<TravelDeskTravelRequest, TravelDeskOtherTransportation>
    travelDeskPassengerNameRecordDocument: Association<
      TravelDeskTravelRequest,
      TravelDeskPassengerNameRecordDocument
    >
    questions: Association<TravelDeskTravelRequest, TravelDeskQuestion>
    travelAgency: Association<TravelDeskTravelRequest, TravelDeskTravelAgency>
  }

  static establishAssociations() {
    this.hasOne(TravelDeskPassengerNameRecordDocument, {
      as: "travelDeskPassengerNameRecordDocument",
      sourceKey: "id",
      foreignKey: "travelDeskTravelRequestId",
    })
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
    })
    this.belongsTo(TravelDeskTravelAgency, {
      as: "travelAgency",
      foreignKey: "travelAgencyId",
    })
    this.hasMany(TravelDeskFlightRequest, {
      as: "flightRequests",
      foreignKey: "travelRequestId",
    })
    this.hasMany(TravelDeskHotel, {
      as: "hotels",
      foreignKey: "travelRequestId",
    })
    this.hasMany(TravelDeskOtherTransportation, {
      as: "otherTransportations",
      foreignKey: "travelRequestId",
    })
    this.hasMany(TravelDeskQuestion, {
      as: "questions",
      foreignKey: "travelRequestId",
    })
    this.hasMany(TravelDeskRentalCar, {
      as: "rentalCars",
      foreignKey: "travelRequestId",
    })
  }
}

TravelDeskTravelRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    travelAuthorizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: TravelAuthorization,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    travelAgencyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TravelDeskTravelAgency,
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    legalFirstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalLastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    strAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalMiddleName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelPurpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    busPhone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    busEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value: string) {
        this.setDataValue("busEmail", value.toLowerCase())
      },
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskTravelRequestStatuses)],
          msg: "Invalid status value",
        },
      },
    },
    birthDate: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isInternationalTravel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    passportCountry: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passportNum: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelContact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    travelPhone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    additionalInformation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelDeskOfficer: {
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
  },
  {
    sequelize,
    modelName: "TravelDeskTravelRequest",
    tableName: "travel_desk_travel_requests",
    paranoid: false,
    indexes: [
      {
        fields: ["travel_authorization_id"],
        name: "travel_desk_travel_requests_travel_authorization_id_unique",
        unique: true,
      },
    ],
    validate: {
      allInternationalTravelFieldsOrNone() {
        if (
          this.isInternationalTravel === true &&
          (isNil(this.passportCountry) || isNil(this.passportNum))
        ) {
          throw new Error("Passport country and number are required for international travel")
        } else if (
          this.isInternationalTravel === false &&
          (!isNil(this.passportCountry) || !isNil(this.passportNum))
        ) {
          throw new Error("Passport country and number are only permitted for international travel")
        }
      },
      allTravelContactFieldsOrNone() {
        if (this.travelContact === true && (isNil(this.travelPhone) || isNil(this.travelEmail))) {
          throw new Error("Travel phone and email are required if travel contact is true")
        } else if (
          this.travelContact === false &&
          (!isNil(this.travelPhone) || !isNil(this.travelEmail))
        ) {
          throw new Error("Travel phone and email are only permitted if travel contact is true")
        }
      },
    },
    scopes: {
      includeIsBookedAttribute() {
        const isBookedQuery = minify(/* sql */ `
          CASE
            WHEN "TravelDeskTravelRequest"."status" = '${TravelDeskTravelRequest.Statuses.BOOKED}' THEN 1
            ELSE 0
          END
        `)
        return {
          attributes: {
            include: [[literal(isBookedQuery), "isBooked"]],
          },
        }
      },
      // TODO: rewrite with ids once data model supports it
      includeIsAssignedToCurrentUserAttribute(currentUserDisplayName: string) {
        const isAssignedToCurrentUserQuery = minify(/* sql */ `
          CASE
            WHEN "travel_desk_officer" = '${currentUserDisplayName}' THEN 1
            ELSE 0
          END
        `)
        return {
          attributes: {
            include: [[literal(isAssignedToCurrentUserQuery), "isAssignedToCurrentUser"]],
          },
        }
      },
      includeTravelStartDateAttribute() {
        const travelStartDateQuery = minify(/* sql */ `(
          SELECT MIN("departure_on")
          FROM "travel_segments"
          WHERE "travel_segments"."travel_authorization_id" = "TravelDeskTravelRequest"."travel_authorization_id"
        )`)
        return {
          attributes: {
            include: [[literal(travelStartDateQuery), "travelStartDate"]],
          },
        }
      },
    },
  }
)

export default TravelDeskTravelRequest
