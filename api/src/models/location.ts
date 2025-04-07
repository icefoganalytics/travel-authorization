import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize"

import sequelize from "@/db/db-client"

export class Location extends Model<InferAttributes<Location>, InferCreationAttributes<Location>> {
  declare id: CreationOptional<number>
  declare province: string
  declare city: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
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
    modelName: "Location",
    tableName: "locations",
    paranoid: false,
    scopes: {
      byProvince(province: string) {
        return {
          where: {
            province,
          },
        }
      },
    },
  }
)
export default Location
