import {
  DataTypes,
  Model,
  Op,
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
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isNil } from "lodash"
import moment from "moment"

import { isRole, RoleNames } from "@/models/role"
import TravelAuthorization from "@/models/travel-authorization"
import TravelDeskFlightOption from "@/models/travel-desk-flight-option"

export enum Statuses {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Table({
  tableName: "users",
  paranoid: false,
})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  static Roles = RoleNames
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

  @Attribute(DataTypes.ARRAY(DataTypes.STRING))
  @NotNull
  @Default([])
  @ValidateAttribute({
    isValidRole(roles: string[] | string) {
      if (isNil(roles)) return
      if (!Array.isArray(roles)) {
        throw new Error("roles must be an array")
      }

      roles.forEach((role: string) => {
        if (isRole(role)) return

        throw new Error(
          `Invalid role: ${role}. Allowed roles are: ${Object.values(RoleNames).join(", ")}`
        )
      })
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

  @Attribute(DataTypes.STRING(255))
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
    return this.roles.includes(RoleNames.ADMIN)
  }

  get isTravelDeskUser(): NonAttribute<boolean> {
    return this.roles.includes(RoleNames.TRAVEL_DESK_USER)
  }

  get isPreApprovedTravelAdmin(): NonAttribute<boolean> {
    return this.roles.includes(RoleNames.PRE_APPROVED_TRAVEL_ADMIN)
  }

  get isUser(): NonAttribute<boolean> {
    return this.roles.includes(RoleNames.USER)
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
    this.addScope("isTravelDeskUser", {
      where: {
        roles: {
          [Op.contains]: [RoleNames.TRAVEL_DESK_USER],
        },
      },
    })
  }
}

export default User
