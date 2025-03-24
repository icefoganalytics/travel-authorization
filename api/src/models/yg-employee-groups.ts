import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Op,
} from "sequelize"

import sequelize from "@/db/db-client"
import BaseModel from "@/models/base-model"

export class YgEmployeeGroup extends BaseModel<
  InferAttributes<YgEmployeeGroup>,
  InferCreationAttributes<YgEmployeeGroup>
> {
  declare id: CreationOptional<number>
  declare department: string
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare order: number
  declare lastSyncSuccessAt: Date | null
  declare lastSyncFailureAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null
}

YgEmployeeGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    lastSyncSuccessAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastSyncFailureAt: {
      type: DataTypes.DATE,
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
    indexes: [
      {
        name: "yg_employee_groups_department_division_branch_unit_unique",
        unique: true,
        fields: ["department", "division", "branch", "unit"],
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
          deletedAt: {
            [Op.is]: null,
          },
        },
      },
    ],
  }
)

YgEmployeeGroup.addSearchScope(["department", "division", "branch", "unit"])

export default YgEmployeeGroup
