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
} from "@sequelize/core/decorators-legacy"

import TravelDeskFlightOption from "@/models/travel-desk-flight-option"

class TravelDeskFlightSegment extends Model<
  InferAttributes<TravelDeskFlightSegment>,
  InferCreationAttributes<TravelDeskFlightSegment>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare flightOptionId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare flightNumber: string

  @Attribute(DataTypes.DATE)
  @NotNull
  declare departAt: Date

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare departLocation: string

  @Attribute(DataTypes.DATE)
  @NotNull
  declare arriveAt: Date

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare arriveLocation: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare duration: string

  // TODO: find out if status should be an enum?
  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare status: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare class: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Default(1)
  declare sortOrder: CreationOptional<number>

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
  @BelongsTo(() => TravelDeskFlightOption, {
    foreignKey: "flightOptionId",
    inverse: {
      as: "flightSegments",
      type: "hasMany",
    },
  })
  declare flightOption?: NonAttribute<TravelDeskFlightOption>

  static establishScopes(): void {
    this.addScope("forTravelRequest", (travelRequestId: number) => {
      return {
        include: [
          {
            association: "flightOption",
            include: [
              {
                association: "flightRequest",
                where: {
                  travelRequestId,
                },
              },
            ],
            required: true,
          },
        ],
      }
    })
  }
}

export default TravelDeskFlightSegment
