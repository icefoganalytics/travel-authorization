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
import TravelDeskFlightOption from "@/models/travel-desk-flight-option"

class TravelDeskFlightSegment extends Model<
  InferAttributes<TravelDeskFlightSegment>,
  InferCreationAttributes<TravelDeskFlightSegment>
> {
  declare id: CreationOptional<number>
  declare flightOptionId: ForeignKey<TravelDeskFlightOption["id"]>
  declare flightNumber: string
  declare departAt: Date
  declare departLocation: string
  declare arriveAt: Date
  declare arriveLocation: string
  declare duration: string
  declare status: string
  declare class: string
  declare sortOrder: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Associations
  declare flightOption?: NonAttribute<TravelDeskFlightOption>

  declare static associations: {
    flightOption: Association<TravelDeskFlightSegment, TravelDeskFlightOption>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskFlightOption, {
      as: "flightOption",
      foreignKey: "flightOptionId",
    })
  }
}

TravelDeskFlightSegment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    flightOptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelDeskFlightOption,
        key: "id",
      },
    },
    flightNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    departAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    departLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    arriveAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arriveLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // TODO: find out if status should be an enum?
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    scopes: {
      forTravelRequest(travelRequestId: number) {
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
      },
    },
  }
)

export default TravelDeskFlightSegment
