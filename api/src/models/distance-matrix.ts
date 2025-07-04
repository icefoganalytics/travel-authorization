import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

@Table({
  tableName: "distanceMatrix",
  timestamps: false,
  paranoid: false,
  underscored: false,
})
export class DistanceMatrix extends Model<
  InferAttributes<DistanceMatrix>,
  InferCreationAttributes<DistanceMatrix>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  // TODO: convert this column to a foreign key to the "locations" table,
  // or use an external api to get this data.
  declare origin: string | null

  @Attribute(DataTypes.STRING(255))
  // TODO: convert this column to a foreign key to the "locations" table,
  // or use an external api to get this data.
  declare destination: string | null

  @Attribute(DataTypes.FLOAT)
  declare kilometers: number | null

  static establishScopes(): void {
    // add as needed
  }
}

export default DistanceMatrix
