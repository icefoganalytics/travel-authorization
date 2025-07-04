import {
  Model,
  DataTypes,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import User from "@/models/user"
import TravelAuthorization, {
  TravelAuthorizationStatuses as Actions,
} from "@/models/travel-authorization"

export { Actions }

@Table({
  paranoid: false,
})
export class TravelAuthorizationActionLog extends Model<
  InferAttributes<TravelAuthorizationActionLog>,
  InferCreationAttributes<TravelAuthorizationActionLog>
> {
  static Actions = Actions

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelAuthorizationId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare actorId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare assigneeId: number

  @Attribute(DataTypes.STRING)
  @NotNull
  declare action: string

  @Attribute(DataTypes.STRING)
  declare note: string | null

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // Associations
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "actionLogs",
      type: "hasMany",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  @BelongsTo(() => User, {
    foreignKey: {
      name: "actorId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "travelAuthorizationActionLogs",
      type: "hasMany",
    },
  })
  declare actor?: NonAttribute<User>

  @BelongsTo(() => User, {
    foreignKey: {
      name: "assigneeId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "assignedTravelAuthorizationActionLogs",
      type: "hasMany",
    },
  })
  declare assignee?: NonAttribute<User>

  static establishScopes(): void {
    // Scopes can be added here if needed
  }
}

export default TravelAuthorizationActionLog
