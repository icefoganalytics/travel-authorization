import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
  Op,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import arrayWrap from "@/utils/array-wrap"

@Table({
  tableName: "locations",
  paranoid: false,
})
export class Location extends Model<InferAttributes<Location>, InferCreationAttributes<Location>> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare province: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare city: string

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  static establishScopes(): void {
    this.addScope("byProvince", (province: string) => {
      return {
        where: {
          province,
        },
      }
    })
    this.addScope("excludeById", (idOrIds: number | number[]) => {
      const ids = arrayWrap(idOrIds)
      return {
        where: {
          id: {
            [Op.notIn]: ids,
          },
        },
      }
    })
  }
}

export default Location
