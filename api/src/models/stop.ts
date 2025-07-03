import { isNil } from "lodash"
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
  Table,
} from "@sequelize/core/decorators-legacy"

import Location from "@/models/location"
import TravelAuthorization from "@/models/travel-authorization"
import TravelSegment from "@/models/travel-segment"

/**
 * @deprecated Whenever you use this model, try and figure out how to migrate
 * the functionality to the TravelSegment model instead.
 * It was too large a project to migrate to the TravelSegment model all at once,
 * so we're doing it piecemeal.
 */
@Table({
  modelName: "Stop",
  tableName: "stops",
  paranoid: false,
})
export class Stop extends Model<InferAttributes<Stop>, InferCreationAttributes<Stop>> {
  static TravelMethods = TravelSegment.TravelMethods
  static AccommodationTypes = TravelSegment.AccommodationTypes
  static BEGINNING_OF_DAY = TravelSegment.FallbackTimes.BEGINNING_OF_DAY
  static END_OF_DAY = TravelSegment.FallbackTimes.END_OF_DAY

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelAuthorizationId: number

  @Attribute(DataTypes.INTEGER)
  declare locationId: number | null

  @Attribute(DataTypes.DATEONLY)
  declare departureDate: Date | string | null // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.TIME)
  declare departureTime: string | null

  @Attribute(DataTypes.STRING(255))
  declare transport: string | null

  @Attribute(DataTypes.STRING(255))
  declare accommodationType: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isActual: boolean

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: Date

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: Date

  // Magic Attributes
  get departureAt(): NonAttribute<Date | null> {
    const departureDate = this.departureDate
    if (isNil(departureDate)) return null

    const timePart = this.departureTime || Stop.BEGINNING_OF_DAY
    const departureDateTime = new Date(`${departureDate}T${timePart}`)
    return departureDateTime
  }

  // Associations
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: "travelAuthorizationId",
    inverse: {
      as: "stops",
      type: "hasMany",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  @BelongsTo(() => Location, {
    foreignKey: "locationId",
    inverse: {
      as: "stops",
      type: "hasMany",
    },
  })
  declare location?: NonAttribute<Location>

  static establishScopes(): void {
    // Scopes can be added here if needed
  }
}

export default Stop
