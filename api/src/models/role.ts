import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize"

import sequelize from "@/db/db-client"

export enum RoleNames {
  ADMIN = "admin",
  USER = "user",
  PAT_ADMIN = "pat_admin",
  DEPARTMENT_ADMIN = "department_admin",
  TD_USER = "td_user",
}

export function isRole(role: string): role is RoleNames {
  return Object.values(RoleNames).includes(role as RoleNames)
}

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  static Roles = RoleNames

  declare id: CreationOptional<number>
  declare name: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // Associations
  /*
    There is a soft relationship between roles and users
    users.roles only includes values from roles.name
    So you can do `WHERE 'some_role' = ANY(users.roles)`
    to get all users with a specific role
  */
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isIn: {
          args: [Object.values(RoleNames)],
          msg: `Role must be one of: ${Object.values(RoleNames).join(", ")}`,
        },
      },
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
    indexes: [
      {
        unique: true,
        fields: ["name"],
        where: {
          deletedAt: null,
        },
      },
    ],
  }
)

export default Role
