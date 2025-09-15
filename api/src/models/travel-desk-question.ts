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
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/** Keep in sync with web/src/api/travel-desk-questions-api.js */
export enum TravelDeskQuestionRequestTypes {
  FLIGHT = "flight",
  HOTEL = "hotel",
  TRANSPORTATION = "transportation",
  RENTAL_CAR = "rental_car",
}

export class TravelDeskQuestion extends Model<
  InferAttributes<TravelDeskQuestion>,
  InferCreationAttributes<TravelDeskQuestion>
> {
  static readonly RequestTypes = TravelDeskQuestionRequestTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskQuestionRequestTypes)],
      msg: `Request type must be one of ${Object.values(TravelDeskQuestionRequestTypes).join(", ")}`,
    },
  })
  declare requestType: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare question: string

  @Attribute(DataTypes.STRING(255))
  declare response: string | null

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
    foreignKey: {
      name: "travelRequestId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "questions",
      type: "hasMany",
    },
  })
  declare travelRequest?: NonAttribute<TravelDeskTravelRequest>

  static establishScopes() {
    // add as needed
  }
}

export default TravelDeskQuestion
