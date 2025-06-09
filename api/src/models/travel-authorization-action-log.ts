import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import User from "./user"
import TravelAuthorization, { TravelAuthorizationStatuses as Actions } from "./travel-authorization"

export { Actions }

export class TravelAuthorizationActionLog extends Model<
  InferAttributes<TravelAuthorizationActionLog>,
  InferCreationAttributes<TravelAuthorizationActionLog>
> {
  static Actions = Actions

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare actorId: ForeignKey<User["id"]>
  declare assigneeId: ForeignKey<User["id"]>
  declare action: string
  declare note: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorization: BelongsToGetAssociationMixin<TravelAuthorization>
  declare setTravelAuthorization: BelongsToSetAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare createTravelAuthorization: BelongsToCreateAssociationMixin<TravelAuthorization>

  declare getActor: BelongsToGetAssociationMixin<User>
  declare setActor: BelongsToSetAssociationMixin<User, User["id"]>
  declare createActor: BelongsToCreateAssociationMixin<User>

  declare getAssignee: BelongsToGetAssociationMixin<User>
  declare setAssignee: BelongsToSetAssociationMixin<User, User["id"]>
  declare createAssignee: BelongsToCreateAssociationMixin<User>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare actor?: NonAttribute<User>
  declare assignee?: NonAttribute<User>

  declare static associations: {
    travelAuthorization: Association<TravelAuthorizationActionLog, TravelAuthorization>
    actor: Association<TravelAuthorizationActionLog, User>
    assignee: Association<TravelAuthorizationActionLog, User>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
    })
    this.belongsTo(User, {
      as: "actor",
      foreignKey: "actorId",
    })
    this.belongsTo(User, {
      as: "assignee",
      foreignKey: "assigneeId",
    })
  }
}

TravelAuthorizationActionLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    travelAuthorizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "travel_authorizations", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "CASCADE",
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "RESTRICT",
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "RESTRICT",
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
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
    paranoid: false,
  }
)

export default TravelAuthorizationActionLog
