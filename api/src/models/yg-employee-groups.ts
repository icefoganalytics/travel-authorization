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

import { YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex } from "@/models/indexes"

import BaseModel from "@/models/base-model"

export class YgEmployeeGroup extends BaseModel<
  InferAttributes<YgEmployeeGroup>,
  InferCreationAttributes<YgEmployeeGroup>
> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  @YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex
  declare department: string

  @Attribute(DataTypes.STRING)
  @YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex
  declare division: string | null

  @Attribute(DataTypes.STRING)
  @YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex
  declare branch: string | null

  @Attribute(DataTypes.STRING)
  @YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex
  declare unit: string | null

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Default(100)
  declare order: CreationOptional<number>

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
    this.addSearchScope(["department", "division", "branch", "unit"])
    this.addScope("isDepartment", () => {
      return {
        where: {
          department: {
            [Op.not]: null,
          },
          division: null,
          branch: null,
          unit: null,
        },
      }
    })
    this.addScope("isDivision", () => {
      return {
        where: {
          department: {
            [Op.not]: null,
          },
          division: {
            [Op.not]: null,
          },
          branch: null,
          unit: null,
        },
      }
    })
    this.addScope("isBranch", () => {
      return {
        where: {
          department: {
            [Op.not]: null,
          },
          division: {
            [Op.not]: null,
          },
          branch: {
            [Op.not]: null,
          },
          unit: null,
        },
      }
    })
    this.addScope("isUnit", () => {
      return {
        where: {
          department: {
            [Op.not]: null,
          },
          division: {
            [Op.not]: null,
          },
          branch: {
            [Op.not]: null,
          },
          unit: {
            [Op.not]: null,
          },
        },
      }
    })
  }
}

export default YgEmployeeGroup
