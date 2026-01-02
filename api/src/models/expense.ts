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
  ModelValidator,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isNil } from "lodash"

import Attachment, { AttachmentTargetTypes } from "@/models/attachment"
import TravelAuthorization from "@/models/travel-authorization"
import User from "@/models/user"

// Keep in sync with web/src/modules/travel-authorizations/components/ExpenseTypeSelect.vue
// TODO: rename to ExpenseCategories to avoid confusion with Expense "Types"
export enum ExpenseExpenseTypes {
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
// move estimates to their own table.
// It's also possible that this is a single table inheritance model,
// and there should be two models, one for each "type".
export enum ExpenseTypes {
  ESTIMATE = "Estimate",
  EXPENSE = "Expense",
}

@Table({
  tableName: "expenses",
})
export class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
  static readonly Types = ExpenseTypes
  static readonly ExpenseTypes = ExpenseExpenseTypes
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
      args: [Object.values(ExpenseTypes)],
      msg: `Type must be one of: ${Object.values(ExpenseTypes).join(", ")}`,
    },
  })
  declare type: ExpenseTypes

  // TODO: rename to ExpenseCategories to avoid confusion with Expense "Types"
  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(ExpenseExpenseTypes)],
      msg: `ExpenseType must be one of: ${Object.values(ExpenseExpenseTypes).join(", ")}`,
    },
  })
  declare expenseType: ExpenseExpenseTypes

  @Attribute(DataTypes.INTEGER)
  declare approverId: number | null

  @Attribute(DataTypes.DATE)
  declare approvedAt: Date | null

  @Attribute(DataTypes.INTEGER)
  declare rejectorId: number | null

  @Attribute(DataTypes.DATE)
  declare rejectedAt: Date | null

  @Attribute(DataTypes.TEXT)
  declare rejectionNote: string | null

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

  // Validators
  @ModelValidator
  ensureApproveRejectExclusivity() {
    if (!isNil(this.approvedAt) && !isNil(this.rejectedAt)) {
      throw new Error("An expense cannot be both approved and rejected.")
    }
  }

  @ModelValidator
  ensureApprovalFieldsSetTogether() {
    const approvalFields = [this.approverId, this.approvedAt]
    const allApprovalFieldsSet = approvalFields.every((field) => !isNil(field))
    const allApprovalFieldsNull = approvalFields.every((field) => isNil(field))
    if (!allApprovalFieldsSet && !allApprovalFieldsNull) {
      throw new Error("Approval fields (approverId, approvedAt) must all be set or all be null.")
    }
  }

  @ModelValidator
  ensureRejectionFieldsSetTogether() {
    const rejectionFields = [this.rejectorId, this.rejectedAt, this.rejectionNote]
    const allRejectionFieldsSet = rejectionFields.every((field) => !isNil(field))
    const allRejectionFieldsNull = rejectionFields.every((field) => isNil(field))
    if (!allRejectionFieldsSet && !allRejectionFieldsNull) {
      throw new Error(
        "Rejection fields (rejectorId, rejectedAt, rejectionNote) must all be set or all be null."
      )
    }
  }

  // Associations
  @BelongsTo(() => User, {
    foreignKey: "approverId",
    inverse: {
      as: "approvedExpenses",
      type: "hasMany",
    },
  })
  declare approver?: NonAttribute<User>

  @BelongsTo(() => User, {
    foreignKey: "rejectorId",
    inverse: {
      as: "rejectedExpenses",
      type: "hasMany",
    },
  })
  declare rejector?: NonAttribute<User>

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
    this.addScope("isExpenseClaimApproved", () => ({
      include: [
        {
          association: "travelAuthorization",
          where: {
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          },
        },
      ],
    }))
  }
}

export default Expense
