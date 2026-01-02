import {
  DataTypes,
  sql,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Default,
  HasMany,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil, isString } from "lodash"
import moment from "moment"

import BaseModel from "@/models/base-model"
import Expense from "@/models/expense"
import TravelAuthorization from "@/models/travel-authorization"
import TravelDeskFlightOption from "@/models/travel-desk-flight-option"

export enum Statuses {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum UserRoles {
  ADMIN = "admin",
  DEPARTMENT_ADMIN = "department_admin",
  FINANCE_USER = "finance_user",
  PRE_APPROVED_TRAVEL_ADMIN = "pre_approved_travel_admin",
  TRAVEL_DESK_USER = "travel_desk_user",
  USER = "user",
}

const USER_ROLES = Object.values<string>(UserRoles)

@Table({
  tableName: "users",
  paranoid: false,
})
export class User extends BaseModel<InferAttributes<User>, InferCreationAttributes<User>> {
  static Roles = UserRoles
  static Statuses = Statuses

  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare sub: string // Auth0 subject attribute

  @Attribute({
    type: DataTypes.STRING(255),
    set(value: string) {
      this.setDataValue("email", value.toLowerCase())
    },
  })
  @NotNull
  declare email: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare status: string

  @Attribute(DataTypes.STRING(255))
  declare firstName: string | null

  @Attribute(DataTypes.STRING(255))
  declare lastName: string | null

  @Attribute({
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: "",
    get() {
      const roles = this.getDataValue("roles")
      if (isEmpty(roles)) return []

      return roles.split(",")
    },
    set(value: string[]) {
      this.setDataValue("roles", value.join(","))
    },
    validate: {
      isValidRole(roles: string) {
        if (isNil(roles) || isEmpty(roles)) return

        const rolesArray = roles.split(",")
        rolesArray.forEach((role: string) => {
          if (USER_ROLES.includes(role)) return

          throw new Error(
            `Invalid role: ${role}. Allowed roles are: ${Object.values(UserRoles).join(", ")}`
          )
        })
      },
    },
  })
  declare roles: CreationOptional<string[]>

  @Attribute(DataTypes.STRING(255))
  declare department: string | null

  @Attribute(DataTypes.STRING(255))
  declare division: string | null

  @Attribute(DataTypes.STRING(255))
  declare branch: string | null

  @Attribute(DataTypes.STRING(255))
  declare unit: string | null

  @Attribute({
    type: DataTypes.STRING(255),
    set(value: string | null) {
      if (isString(value) && isEmpty(value?.trim())) {
        this.setDataValue("mailcode", null)
      } else {
        this.setDataValue("mailcode", value)
      }
    },
  })
  declare mailcode: string | null

  @Attribute(DataTypes.STRING(255))
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

  // Magic attributes
  get isAdmin(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.ADMIN)
  }

  get isDepartmentAdmin(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.DEPARTMENT_ADMIN)
  }

  get isFinanceUser(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.FINANCE_USER)
  }

  get isPreApprovedTravelAdmin(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.PRE_APPROVED_TRAVEL_ADMIN)
  }

  get isTravelDeskUser(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.TRAVEL_DESK_USER)
  }

  get isUser(): NonAttribute<boolean> {
    return this.roles.includes(UserRoles.USER)
  }

  // TODO: push this into a serializer, once its no longer in legacy code
  get displayName(): NonAttribute<string> {
    return [this.firstName, this.lastName].filter(Boolean).join(" ") || ""
  }

  isTimeToSyncWithEmployeeDirectory(): NonAttribute<boolean> {
    if (this.lastSyncFailureAt !== null) {
      return false
    }

    if (this.lastSyncSuccessAt === null) {
      return true
    }

    const current = moment.utc()
    const lastSyncDate = moment.utc(this.lastSyncSuccessAt)

    return !current.isSame(lastSyncDate, "day")
  }

  // Associations
  @HasMany(() => Expense, {
    foreignKey: "approverId",
    inverse: "approver",
  })
  declare approvedExpenses?: NonAttribute<Expense[]>

  @HasMany(() => Expense, {
    foreignKey: "rejectorId",
    inverse: "rejector",
  })
  declare rejectedExpenses?: NonAttribute<Expense[]>

  @HasMany(() => TravelAuthorization, {
    foreignKey: "userId",
    inverse: "user",
  })
  declare travelAuthorizations?: NonAttribute<TravelAuthorization[]>

  @HasMany(() => TravelDeskFlightOption, {
    foreignKey: "travelerId",
    inverse: "traveler",
  })
  declare travelDeskFlightOptions?: NonAttribute<TravelDeskFlightOption[]>

  static establishScopes(): void {
    this.addSearchScope(["firstName", "lastName", "email"])

    this.addScope("isTravelDeskUser", () => {
      const roleInRolesQuery = sql`
        ${UserRoles.TRAVEL_DESK_USER} = ANY (string_to_array(roles, ','))
      `
      return {
        where: roleInRolesQuery,
      }
    })
  }
}

export default User
