import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Index,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

export class TravelDeskProductType extends Model<
  InferAttributes<TravelDeskProductType>,
  InferCreationAttributes<TravelDeskProductType>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @Index({ unique: true })
  @ValidateAttribute({ is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ })
  declare code: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @Index({ unique: true })
  @ValidateAttribute({ notEmpty: true })
  declare name: string

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null
}

export default TravelDeskProductType
