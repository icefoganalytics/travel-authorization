import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "@sequelize/core"

import sequelize from "@/db/db-client"
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

  declare id: CreationOptional<number>
  declare travelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare requestType: string
  declare question: string
  declare response: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Associations
  declare travelRequest?: NonAttribute<TravelDeskTravelRequest>

  declare static associations: {
    travelRequest: Association<TravelDeskQuestion, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      foreignKey: "travelRequestId",
      as: "travelRequest",
    })
  }
}

TravelDeskQuestion.init(
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
      onDelete: "CASCADE",
    },
    requestType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskQuestionRequestTypes)],
          msg: `Request type must be one of ${Object.values(TravelDeskQuestionRequestTypes).join(", ")}`,
        },
      },
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    response: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
  }
)

export default TravelDeskQuestion
