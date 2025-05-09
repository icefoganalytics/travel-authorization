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
import { isNil } from "lodash"
import { DateTime } from "luxon"

import sequelize from "@/db/db-client"

import Location from "@/models/location"
import Stop from "@/models/stop"
import TravelAuthorization from "@/models/travel-authorization"

export enum FallbackTimes {
  BEGINNING_OF_DAY = "00:00:00",
  END_OF_DAY = "23:59:59",
}

// Keep in sync with web/src/api/stops-api.js
// Until both are using a shared location
// TODO: normalize casing of these to snake_case, and add UI localization
export enum TravelMethods {
  AIRCRAFT = "Aircraft",
  POOL_VEHICLE = "Pool Vehicle",
  PERSONAL_VEHICLE = "Personal Vehicle",
  RENTAL_VEHICLE = "Rental Vehicle",
  BUS = "Bus",
  OTHER = "Other", // value stored in modeOfTransportOther
}

// Keep in sync with web/src/api/stops-api.js
// Until both are using a shared location
// TODO: normalize casing of these to snake_case, and add UI localization
export enum AccommodationTypes {
  HOTEL = "Hotel",
  PRIVATE = "Private",
  OTHER = "Other", // value stored in accommodationTypeOther
}

export class TravelSegment extends Model<
  InferAttributes<TravelSegment>,
  InferCreationAttributes<TravelSegment>
> {
  static TravelMethods = TravelMethods
  static AccommodationTypes = AccommodationTypes
  static FallbackTimes = FallbackTimes

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare departureLocationId: ForeignKey<Location["id"]> | null
  declare arrivalLocationId: ForeignKey<Location["id"]> | null
  declare segmentNumber: number
  declare departureOn: Date | string | null // DATEONLY accepts Date or string, but returns string
  declare departureTime: string | null
  declare modeOfTransport: string
  declare modeOfTransportOther: string | null
  declare accommodationType: string | null
  declare accommodationTypeOther: string | null
  declare isActual: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Magic methods
  get departureOnAsString(): NonAttribute<string | null> {
    if (this.departureOn instanceof Date) {
      return DateTime.fromJSDate(this.departureOn).toFormat("yyyy-LL-dd")
    }

    return this.departureOn
  }

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorization: BelongsToGetAssociationMixin<TravelAuthorization>
  declare setTravelAuthorization: BelongsToSetAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare createTravelAuthorization: BelongsToCreateAssociationMixin<TravelAuthorization>

  declare getDepartureLocation: BelongsToGetAssociationMixin<Location>
  declare setDepartureLocation: BelongsToSetAssociationMixin<Location, Location["id"]>
  declare createDepartureLocation: BelongsToCreateAssociationMixin<Location>

  declare getArrivalLocation: BelongsToGetAssociationMixin<Location>
  declare setArrivalLocation: BelongsToSetAssociationMixin<Location, Location["id"]>
  declare createArrivalLocation: BelongsToCreateAssociationMixin<Location>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare departureLocation?: NonAttribute<Location>
  declare arrivalLocation?: NonAttribute<Location>

  declare static associations: {
    travelAuthorization: Association<TravelSegment, TravelAuthorization>
    departureLocation: Association<TravelSegment, Location>
    arrivalLocation: Association<TravelSegment, Location>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
      onDelete: "CASCADE",
    })
    this.belongsTo(Location, {
      as: "departureLocation",
      foreignKey: "departureLocationId",
      onDelete: "RESTRICT",
    })
    this.belongsTo(Location, {
      as: "arrivalLocation",
      foreignKey: "arrivalLocationId",
      onDelete: "RESTRICT",
    })
  }

  // Shim until Stop model is fully removed
  static buildFromStops({
    travelAuthorizationId,
    segmentNumber,
    departureStop,
    arrivalStop,
  }: {
    travelAuthorizationId: number
    segmentNumber: number
    departureStop: Stop
    arrivalStop: Stop
  }) {
    if (departureStop.isActual !== arrivalStop.isActual) {
      throw new Error("Departure and arrival stops must have the same isActual value")
    }

    if (isNil(departureStop.transport)) {
      throw new Error(`Missing transport on Stop#${departureStop.id}`)
    }

    const modeOfTransport = (Object.values(TravelMethods) as string[]).includes(
      departureStop.transport
    )
      ? departureStop.transport
      : TravelMethods.OTHER
    const modeOfTransportOther =
      modeOfTransport === TravelMethods.OTHER ? departureStop.transport : null

    const accommodationType =
      isNil(departureStop.accommodationType) ||
      (Object.values(AccommodationTypes) as string[]).includes(departureStop.accommodationType)
        ? departureStop.accommodationType
        : AccommodationTypes.OTHER
    const accommodationTypeOther =
      accommodationType === AccommodationTypes.OTHER ? departureStop.accommodationType : null

    return TravelSegment.build({
      travelAuthorizationId: travelAuthorizationId,
      segmentNumber,
      departureLocationId: departureStop.locationId,
      arrivalLocationId: arrivalStop.locationId,
      departureOn: departureStop.departureDate,
      departureTime: departureStop.departureTime,
      modeOfTransport,
      modeOfTransportOther,
      accommodationType,
      accommodationTypeOther,
      isActual: departureStop.isActual,
    })
  }

  get departureAt(): NonAttribute<Date | null> {
    return this.departureAtWithTimeFallback(FallbackTimes.BEGINNING_OF_DAY)
  }

  departureAtWithTimeFallback(fallbackTime: FallbackTimes): NonAttribute<Date | null> {
    const departureOn = this.departureOn
    if (isNil(departureOn)) return null

    const timePart = this.departureTime || fallbackTime
    return new Date(`${departureOn}T${timePart}`)
  }
}

TravelSegment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    travelAuthorizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departureLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    arrivalLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    segmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departureOn: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    modeOfTransport: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelMethods)],
          msg: "Invalid travel method value",
        },
      },
    },
    modeOfTransportOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    accommodationType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(AccommodationTypes)],
          msg: "Invalid accommodation type value",
        },
        accommodationTypeOtherIsNull(value: string) {
          if (!isNil(this.accommodationTypeOther) && value !== AccommodationTypes.OTHER) {
            throw new Error(
              `accommodationType must be ${AccommodationTypes.OTHER} when accommodationTypeOther is set`
            )
          }
        },
      },
    },
    accommodationTypeOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        accommodationTypeIsOther(value: string | null) {
          if (!isNil(value) && this.accommodationType !== AccommodationTypes.OTHER) {
            throw new Error(
              `accommodationTypeOther can only have a value if accommodationType is ${AccommodationTypes.OTHER}`
            )
          }
        },
      },
    },
    isActual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    paranoid: false,
    validate: {
      modeOfTransportOtherConsistency() {
        if (!isNil(this.modeOfTransportOther) && this.modeOfTransport !== TravelMethods.OTHER) {
          throw new Error(
            `modeOfTransport must be ${TravelMethods.OTHER} when modeOfTransportOther is set`
          )
        } else if (
          this.modeOfTransport === TravelMethods.OTHER &&
          isNil(this.modeOfTransportOther)
        ) {
          throw new Error(
            `modeOfTransportOther can only have a value if modeOfTransport is ${TravelMethods.OTHER}`
          )
        }
      },
      accommodationTypeOtherConsistency() {
        if (
          !isNil(this.accommodationTypeOther) &&
          this.accommodationType !== AccommodationTypes.OTHER
        ) {
          throw new Error(
            `accommodationType must be ${AccommodationTypes.OTHER} when accommodationTypeOther is set`
          )
        } else if (
          this.accommodationType === AccommodationTypes.OTHER &&
          isNil(this.accommodationTypeOther)
        ) {
          throw new Error(
            `accommodationTypeOther can only have a value if accommodationType is ${AccommodationTypes.OTHER}`
          )
        }
      },
      departureLocationIdAndArrivalLocationIdConsistency() {
        if (this.departureLocationId === this.arrivalLocationId) {
          throw new Error("departureLocationId and arrivalLocationId must be different")
        }
      },
    },
  }
)

export default TravelSegment
