import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

export class TravelPurpose extends Model<
  InferAttributes<TravelPurpose>,
  InferCreationAttributes<TravelPurpose>
> {
  declare id: CreationOptional<number>
  declare purpose: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

TravelPurpose.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: "travel_purposes",
    modelName: "TravelPurpose",
    paranoid: false,
  }
)

export default TravelPurpose
