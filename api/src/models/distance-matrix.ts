import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

export class DistanceMatrix extends Model<
  InferAttributes<DistanceMatrix>,
  InferCreationAttributes<DistanceMatrix>
> {
  declare id: CreationOptional<number>
  declare origin: string | null
  declare destination: string | null
  declare kilometers: number | null
}

DistanceMatrix.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // TODO: convert this column to a foreign key to the "locations" table,
    // or use an external api to get this data.
    origin: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // TODO: convert this column to a foreign key to the "locations" table,
    // or use an external api to get this data.
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kilometers: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DistanceMatrix",
    tableName: "distanceMatrix",
    underscored: false,
    timestamps: false,
    paranoid: false,
  }
)

export default DistanceMatrix
