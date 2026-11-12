import {
  DataTypes,
  Model,
  sql,
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
  HasMany,
  HasOne,
  Index,
  ModelValidator,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isNil } from "lodash"

import Attachment from "@/models/attachment"
import TravelAuthorization from "@/models/travel-authorization"
import TravelDeskFlightRequest from "@/models/travel-desk-flight-request"
import TravelDeskHotel from "@/models/travel-desk-hotel"
import TravelDeskOtherTransportation from "@/models/travel-desk-other-transportation"
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

@Table({
  tableName: "travel_desk_travel_requests",
  paranoid: false,
})
export class TravelDeskTravelRequest extends Model<
  InferAttributes<TravelDeskTravelRequest>,
  InferCreationAttributes<TravelDeskTravelRequest>
> {
  static Statuses = TravelDeskTravelRequestStatuses

  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Index({
    name: "travel_desk_travel_requests_travel_authorization_id_unique",
    unique: true,
  })
  declare travelAuthorizationId: number

  @Attribute(DataTypes.INTEGER)
  declare travelAgencyId: number | null

  // TODO: rename this to something externalRecordIdentifier in the future.
  // It will be used to link to external systems like TravCom or the new Travel datadump from Travelport.
  // I believe it coresponds to the RecordLocator field in the new Travel datadump and will be used
  // to generate invoices.
  @Attribute(DataTypes.STRING(255))
  declare invoiceNumber: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare legalFirstName: string

  @Attribute(DataTypes.STRING(255))
  declare legalMiddleName: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare legalLastName: string

  @Attribute(DataTypes.STRING(255))
  declare birthDate: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare strAddress: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare city: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare province: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare postalCode: string

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isInternationalTravel: CreationOptional<boolean>

  @Attribute(DataTypes.STRING(255))
  declare passportCountry: string | null

  @Attribute(DataTypes.STRING(255))
  declare passportNum: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare travelPurpose: string

  @Attribute(DataTypes.STRING(255))
  declare travelLocation: string | null

  @Attribute(DataTypes.STRING(255))
  declare travelNotes: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare busPhone: string

  @Attribute({
    type: DataTypes.STRING(255),
    set(value: string) {
      this.setDataValue("busEmail", value.toLowerCase())
    },
  })
  @NotNull
  declare busEmail: string

  @Attribute(DataTypes.BOOLEAN)
  declare travelContact: boolean | null

  @Attribute(DataTypes.STRING(255))
  declare travelPhone: string | null

  @Attribute(DataTypes.STRING(255))
  declare travelEmail: string | null

  @Attribute(DataTypes.STRING(255))
  declare additionalInformation: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskTravelRequestStatuses)],
      msg: "Invalid status value",
    },
  })
  declare status: string

  @Attribute(DataTypes.STRING(255))
  declare travelDeskOfficer: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // Validators
  @ModelValidator
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
  }

  @ModelValidator
  allTravelContactFieldsOrNone() {
    if (this.travelContact === true && (isNil(this.travelPhone) || isNil(this.travelEmail))) {
      throw new Error("Travel phone and email are required if travel contact is true")
    } else if (
      this.travelContact === false &&
      (!isNil(this.travelPhone) || !isNil(this.travelEmail))
    ) {
      throw new Error("Travel phone and email are only permitted if travel contact is true")
    }
  }

  // Associations
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "travelDeskTravelRequest",
      type: "hasOne",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  @BelongsTo(() => TravelDeskTravelAgency, {
    foreignKey: {
      name: "travelAgencyId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "travelDeskTravelRequest",
      type: "hasOne",
    },
  })
  declare travelAgency?: NonAttribute<TravelDeskTravelAgency>

  @HasOne(() => Attachment, {
    foreignKey: {
      name: "targetId",
      allowNull: true,
    },
    foreignKeyConstraints: false,
    inverse: "travelDeskTravelRequest",
    scope: {
      targetType: Attachment.TargetTypes.TravelDeskTravelRequest,
    },
  })
  declare passengerNameRecordDocument?: NonAttribute<Attachment>

  @HasMany(() => TravelDeskFlightRequest, {
    foreignKey: "travelRequestId",
    inverse: "travelRequest",
  })
  declare flightRequests?: NonAttribute<TravelDeskFlightRequest[]>

  @HasMany(() => TravelDeskHotel, {
    foreignKey: "travelRequestId",
    inverse: "travelRequest",
  })
  declare hotels?: NonAttribute<TravelDeskHotel[]>

  @HasMany(() => TravelDeskOtherTransportation, {
    foreignKey: "travelRequestId",
    inverse: "travelRequest",
  })
  declare otherTransportations?: NonAttribute<TravelDeskOtherTransportation[]>

  @HasMany(() => TravelDeskQuestion, {
    foreignKey: {
      name: "travelRequestId",
      onDelete: "CASCADE",
    },
    inverse: "travelRequest",
  })
  declare questions?: NonAttribute<TravelDeskQuestion[]>

  @HasMany(() => TravelDeskRentalCar, {
    foreignKey: "travelRequestId",
    inverse: "travelRequest",
  })
  declare rentalCars?: NonAttribute<TravelDeskRentalCar[]>

  static establishScopes(): void {
    this.addScope("includeIsBookedAttribute", () => {
      const isBookedQuery = sql`
        CASE
          WHEN "TravelDeskTravelRequest"."status" = ${TravelDeskTravelRequest.Statuses
          .BOOKED} THEN 1
          ELSE 0
        END
      `
      return {
        attributes: {
          include: [[isBookedQuery, "isBooked"]],
        },
      }
    })
    // TODO: rewrite with ids once data model supports it
    this.addScope("includeIsAssignedToCurrentUserAttribute", (currentUserDisplayName: string) => {
      const isAssignedToCurrentUserQuery = sql`
        CASE
          WHEN "travel_desk_officer" = ${currentUserDisplayName} THEN 1
          ELSE 0
        END
      `
      return {
        attributes: {
          include: [[isAssignedToCurrentUserQuery, "isAssignedToCurrentUser"]],
        },
      }
    })
    this.addScope("includeTravelStartDateAttribute", () => {
      const travelStartDateQuery = sql`
        (
          SELECT
            MIN("departure_on")
          FROM
            "travel_segments"
          WHERE
            "travel_segments"."travel_authorization_id" = "TravelDeskTravelRequest"."travel_authorization_id"
        )
      `
      return {
        attributes: {
          include: [[travelStartDateQuery, "travelStartDate"]],
        },
      }
    })
  }
}

export default TravelDeskTravelRequest
