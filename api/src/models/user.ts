import {
  Association,
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
} from "sequelize"
import { isNil } from "lodash"
import moment from "moment"

import sequelize from "@/db/db-client"
import { isRole, RoleNames } from "@/models/role"
import TravelAuthorization from "@/models/travel-authorization"
import TravelDeskFlightOption from "@/models/travel-desk-flight-option"

export enum Statuses {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  static Roles = RoleNames
  static Statuses = Statuses

  declare id: CreationOptional<number>
  declare sub: string // Auth0 subject attribute
  declare email: string
  declare status: string
  declare firstName: string | null
  declare lastName: string | null
  declare roles: string[]
  declare department: string | null
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare mailcode: string | null
  declare manager: string | null
  declare lastSyncSuccessAt: Date | null
  declare lastSyncFailureAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Special attributes
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

  // Associations
  declare travelAuthorizations?: NonAttribute<TravelAuthorization[]>
  declare travelDeskFlightOptions?: NonAttribute<TravelDeskFlightOption[]>

  declare static associations: {
    travelAuthorizations: Association<User, TravelAuthorization>
    travelDeskFlightOptions: Association<User, TravelDeskFlightOption>
  }

  static establishAssociations() {
    this.hasMany(TravelAuthorization, {
      as: "travelAuthorizations",
      foreignKey: "userId",
    })
    this.hasMany(TravelDeskFlightOption, {
      as: "travelDeskFlightOptions",
      foreignKey: "travelerId",
    })
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
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // Auth0 subject attribute
    sub: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value: string) {
        this.setDataValue("email", value.toLowerCase())
      },
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: Statuses.INACTIVE,
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING(255)),
      allowNull: false,
      defaultValue: [],
      validate: {
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
      },
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mailcode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    manager: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    paranoid: false,
    scopes: {
      isTravelDeskUser() {
        return {
          where: {
            roles: {
              [Op.contains]: [RoleNames.TRAVEL_DESK_USER],
            },
          },
        }
      },
    },
  }
)

export default User
