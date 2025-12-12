import {
  DataTypes,
  Op,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"

export class YgEmployee extends BaseModel<
  InferAttributes<YgEmployee>,
  InferCreationAttributes<YgEmployee>
> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare email: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare username: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare fullName: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare firstName: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare lastName: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare department: string

  @Attribute(DataTypes.STRING)
  declare division: string | null

  @Attribute(DataTypes.STRING)
  declare branch: string | null

  @Attribute(DataTypes.STRING)
  declare unit: string | null

  @Attribute(DataTypes.STRING)
  declare organization: string | null

  @Attribute(DataTypes.STRING)
  declare title: string | null

  @Attribute(DataTypes.STRING)
  declare suite: string | null

  @Attribute(DataTypes.STRING)
  declare phoneOffice: string | null

  @Attribute(DataTypes.STRING)
  declare faxOffice: string | null

  @Attribute(DataTypes.STRING)
  declare mobile: string | null

  @Attribute(DataTypes.STRING)
  declare office: string | null

  @Attribute(DataTypes.STRING)
  declare address: string | null

  @Attribute(DataTypes.STRING)
  declare poBox: string | null

  @Attribute(DataTypes.STRING)
  declare community: string | null

  @Attribute(DataTypes.STRING)
  declare postalCode: string | null

  @Attribute(DataTypes.STRING)
  declare latitude: string | null

  @Attribute(DataTypes.STRING)
  declare longitude: string | null

  @Attribute(DataTypes.STRING)
  declare mailcode: string | null

  @Attribute(DataTypes.STRING)
  declare manager: string | null

  @Attribute(DataTypes.DATE)
  declare lastSyncSuccessAt: Date | null

  @Attribute(DataTypes.DATE)
  declare lastSyncFailureAt: Date | null

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

  static establishScopes(): void {
    this.addSearchScope(["email", "username", "fullName", "firstName", "lastName", "title"])
    this.addScope("excludingByFullNames", (fullNames: string[]) => {
      return {
        where: {
          fullName: {
            [Op.notIn]: fullNames,
          },
        },
      }
    })
  }
}

export default YgEmployee
