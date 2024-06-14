import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"
import { isNil } from "lodash"
import moment from "moment"

import sequelize from "@/db/db-client"
import TravelAuthorization from "./travel-authorization"

export enum Roles {
  ADMIN = "admin",
  USER = "user",
  PAT_ADMIN = "pat_admin",
  DEPARTMENT_ADMIN = "department_admin",
  TD_USER = "td_user",
}

export enum Statuses {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

function isRole(role: string): role is Roles {
  return Object.values(Roles).includes(role as Roles)
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  static Roles = Roles
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

  // Associations
  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorizations: HasManyGetAssociationsMixin<TravelAuthorization>
  declare setTravelAuthorizations: HasManySetAssociationsMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare hasTravelAuthorization: HasManyHasAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare hasTravelAuthorizations: HasManyHasAssociationsMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare addTravelAuthorization: HasManyAddAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare addTravelAuthorizations: HasManyAddAssociationsMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare removeTravelAuthorization: HasManyRemoveAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare removeTravelAuthorizations: HasManyRemoveAssociationsMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare countTravelAuthorizations: HasManyCountAssociationsMixin
  declare createTravelAuthorization: HasManyCreateAssociationMixin<TravelAuthorization>

  declare travelAuthorizations?: NonAttribute<TravelAuthorization[]>

  declare static associations: {
    travelAuthorizations: Association<User, TravelAuthorization>
  }

  static establishAssociations() {
    this.hasMany(TravelAuthorization, {
      as: "travelAuthorizations",
      sourceKey: "id",
      foreignKey: "userId",
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
              `Invalid role: ${role}. Allowed roles are: ${Object.values(Roles).join(", ")}`
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
    hooks: {
        afterCreate(attributes, options) {
            const stack = new Error().stack;
            console.log(`User created: ${attributes.email}`);
            console.log(`Stack trace: ${stack}`);
        },
    }
  }
)

export default User
