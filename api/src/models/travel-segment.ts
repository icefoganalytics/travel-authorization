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
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isNil } from "lodash"
import { DateTime } from "luxon"

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

@Table({
  paranoid: false,
})
export class TravelSegment extends Model<
  InferAttributes<TravelSegment>,
  InferCreationAttributes<TravelSegment>
> {
  static TravelMethods = TravelMethods
  static AccommodationTypes = AccommodationTypes
  static FallbackTimes = FallbackTimes

  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelAuthorizationId: number

  @Attribute(DataTypes.INTEGER)
  declare departureLocationId: number | null

  @Attribute(DataTypes.INTEGER)
  declare arrivalLocationId: number | null

  @Attribute(DataTypes.INTEGER)
  declare segmentNumber: number

  @Attribute(DataTypes.DATEONLY)
  declare departureOn: Date | string | null // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.TIME)
  declare departureTime: string | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelMethods)],
      msg: "Invalid travel method value",
    },
  })
  declare modeOfTransport: string

  @Attribute(DataTypes.STRING(255))
  declare modeOfTransportOther: string | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
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
  })
  declare accommodationType: string | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    accommodationTypeIsOther(value: string | null) {
      if (!isNil(value) && this.accommodationType !== AccommodationTypes.OTHER) {
        throw new Error(
          `accommodationTypeOther can only have a value if accommodationType is ${AccommodationTypes.OTHER}`
        )
      }
    },
  })
  declare accommodationTypeOther: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isActual: CreationOptional<boolean>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // Magic methods
  get departureOnAsString(): NonAttribute<string | null> {
    if (this.departureOn instanceof Date) {
      return DateTime.fromJSDate(this.departureOn).toFormat("yyyy-LL-dd")
    }

    return this.departureOn
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

  // Validators
  @ModelValidator
  modeOfTransportOtherConsistency() {
    if (!isNil(this.modeOfTransportOther) && this.modeOfTransport !== TravelMethods.OTHER) {
      throw new Error(
        `modeOfTransport must be ${TravelMethods.OTHER} when modeOfTransportOther is set`
      )
    } else if (this.modeOfTransport === TravelMethods.OTHER && isNil(this.modeOfTransportOther)) {
      throw new Error(
        `modeOfTransportOther can only have a value if modeOfTransport is ${TravelMethods.OTHER}`
      )
    }
  }

  @ModelValidator
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
  }

  @ModelValidator
  departureLocationIdAndArrivalLocationIdConsistency() {
    if (this.departureLocationId === this.arrivalLocationId) {
      throw new Error("departureLocationId and arrivalLocationId must be different")
    }
  }

  // Associations
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "travelSegments",
      type: "hasMany",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  @BelongsTo(() => Location, {
    foreignKey: {
      name: "departureLocationId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "departureTravelSegments",
      type: "hasMany",
    },
  })
  declare departureLocation?: NonAttribute<Location>

  @BelongsTo(() => Location, {
    foreignKey: {
      name: "arrivalLocationId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "arrivalTravelSegments",
      type: "hasMany",
    },
  })
  declare arrivalLocation?: NonAttribute<Location>

  static establishScopes(): void {
    // add as needed
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
}

export default TravelSegment
