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
  Default,
  Index,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

export enum RoleNames {
  ADMIN = "admin",
  USER = "user",
  PRE_APPROVED_TRAVEL_ADMIN = "pre_approved_travel_admin",
  DEPARTMENT_ADMIN = "department_admin",
  TRAVEL_DESK_USER = "travel_desk_user",
}

export function isRole(role: string): role is RoleNames {
  return Object.values(RoleNames).includes(role as RoleNames)
}

/** @deprecated - users now store roles in a users.roles -> string[] column */
export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  static Names = RoleNames

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @Index({
    unique: true,
    where: {
      deletedAt: null,
    },
  })
  @ValidateAttribute({
    isIn: {
      args: [Object.values(RoleNames)],
      msg: `Role must be one of: ${Object.values(RoleNames).join(", ")}`,
    },
  })
  declare name: string

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

  // Associations
  /*
    There is a soft relationship between roles and users
    users.roles only includes values from roles.name
    So you can do `WHERE 'some_role' = ANY(users.roles)`
    to get all users with a specific role
  */
}

/** @deprecated - users now store roles in a users.roles -> string[] column */
export default Role
