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
  HasMany,
  ModelValidator,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty } from "lodash"

import TravelDeskFlightRequest from "@/models/travel-desk-flight-request"
import TravelDeskFlightSegment from "@/models/travel-desk-flight-segment"
import User from "@/models/user"

const DOES_NOT_WORK = 0

class TravelDeskFlightOption extends Model<
  InferAttributes<TravelDeskFlightOption>,
  InferCreationAttributes<TravelDeskFlightOption>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare flightRequestId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelerId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare cost: string

  @Attribute(DataTypes.INTEGER)
  @ValidateAttribute({
    min: {
      args: [DOES_NOT_WORK],
      msg: "Invalid flight preference order",
    },
  })
  declare flightPreferenceOrder: number | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare leg: string // TODO: validate if "leg" is being used?

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare duration: string

  @Attribute(DataTypes.TEXT)
  declare additionalInformation: string | null

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
  flightPreferenceOrderAndAdditionalInformationConsistency() {
    if (
      this.flightPreferenceOrder === DOES_NOT_WORK &&
      isEmpty(this.additionalInformation)
    ) {
      throw new Error(
        "Additional information is required when flight preference order is 'Does not work'"
      )
    }
  }

  // Associations
  @BelongsTo(() => TravelDeskFlightRequest, {
    foreignKey: "flightRequestId",
    inverse: {
      as: "flightOptions",
      type: "hasMany",
    },
  })
  declare flightRequest?: NonAttribute<TravelDeskFlightRequest>

  @BelongsTo(() => User, {
    foreignKey: "travelerId",
    inverse: {
      as: "flightOptions",
      type: "hasMany",
    },
  })
  declare traveler?: NonAttribute<User>

  @HasMany(() => TravelDeskFlightSegment, {
    foreignKey: "flightOptionId",
    inverse: "flightOption",
  })
  declare flightSegments?: NonAttribute<TravelDeskFlightSegment[]>

  static establishScopes(): void {
    this.addScope("forTravelRequest", (travelDeskTravelRequestId: number) => {
      return {
        include: [
          {
            association: "flightRequest",
            where: {
              travelRequestId: travelDeskTravelRequestId,
            },
          },
        ],
      }
    })
  }
}

export default TravelDeskFlightOption
