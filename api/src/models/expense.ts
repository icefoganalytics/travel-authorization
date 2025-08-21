import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  HasOne,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelAuthorization from "@/models/travel-authorization"
import Attachment, { AttachmentTargetTypes } from "@/models/attachment"

// Keep in sync with web/src/modules/travel-authorizations/components/ExpenseTypeSelect.vue
export enum ExpenseTypes {
  ACCOMMODATIONS = "Accommodations",
  TRANSPORTATION = "Transportation",
  MEALS_AND_INCIDENTALS = "Meals & Incidentals",
  NON_TRAVEL_STATUS = "Non-Travel Status",
}

export enum ExpenseCurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

// TODO: replace this with a boolean of isEstimate or
// move estimates to there own table.
// It's also possible that this is a single table inheritance model,
// and there should be two models, one for each "type".
export enum Types {
  ESTIMATE = "Estimate",
  EXPENSE = "Expense",
}

@Table({
  tableName: "expenses",
})
export class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
  static readonly Types = Types
  static readonly ExpenseTypes = ExpenseTypes
  static readonly CurrencyTypes = ExpenseCurrencyTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelAuthorizationId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare description: string

  @Attribute(DataTypes.DATEONLY)
  declare date: Date | string | null // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.FLOAT)
  @NotNull
  declare cost: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(ExpenseCurrencyTypes)],
      msg: `Currency must be one of: ${Object.values(ExpenseCurrencyTypes).join(", ")}`,
    },
  })
  declare currency: ExpenseCurrencyTypes

  @Attribute(DataTypes.STRING)
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(Types)],
      msg: `Type must be one of: ${Object.values(Types).join(", ")}`,
    },
  })
  declare type: Types

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(ExpenseTypes)],
      msg: `ExpenseType must be one of: ${Object.values(ExpenseTypes).join(", ")}`,
    },
  })
  declare expenseType: ExpenseTypes

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
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: "travelAuthorizationId",
    inverse: {
      as: "expenses",
      type: "hasMany",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  @HasOne(() => Attachment, {
    foreignKey: {
      name: "targetId",
      allowNull: true,
    },
    inverse: "expense",
    scope: {
      targetType: AttachmentTargetTypes.Expense,
    },
  })
  declare receipt?: NonAttribute<Attachment>

  static establishScopes(): void {
    // add as needed
  }
}

export default Expense
