import {
  DataTypes,
  Model,
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
  HasMany,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelAuthorizationPreApproval from "@/models/travel-authorization-pre-approval"
import TravelAuthorizationPreApprovalDocument from "@/models/travel-authorization-pre-approval-document"
import User from "@/models/user"

/**
 * Keep in sync with web/src/api/travel-authorization-pre-approval-submissions-api.js
 */
export enum TravelAuthorizationPreApprovalSubmissionStatuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  FINISHED = "finished",
}

export class TravelAuthorizationPreApprovalSubmission extends Model<
  InferAttributes<TravelAuthorizationPreApprovalSubmission>,
  InferCreationAttributes<TravelAuthorizationPreApprovalSubmission>
> {
  static readonly Statuses = TravelAuthorizationPreApprovalSubmissionStatuses

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.INTEGER)
  declare approverId: number | null

  @Attribute(DataTypes.DATE)
  declare approvedAt: Date | null

  @Attribute(DataTypes.INTEGER)
  declare rejectorId: number | null

  @Attribute(DataTypes.DATE)
  declare rejectedAt: Date | null

  @Attribute(DataTypes.STRING)
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelAuthorizationPreApprovalSubmissionStatuses)],
      msg: `Status must be one of: ${Object.values(TravelAuthorizationPreApprovalSubmissionStatuses).join(", ")}`,
    },
  })
  declare status: TravelAuthorizationPreApprovalSubmissionStatuses

  @Attribute(DataTypes.STRING)
  @NotNull
  declare department: string

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
  @BelongsTo(() => User, {
    foreignKey: "approverId",
    inverse: {
      as: "approvedTravelAuthorizationPreApprovalSubmissions",
      type: "hasMany",
    },
  })
  declare approver?: NonAttribute<User>

  @BelongsTo(() => User, {
    foreignKey: "creatorId",
    inverse: {
      as: "createdTravelAuthorizationPreApprovalSubmissions",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @HasMany(() => TravelAuthorizationPreApprovalDocument, {
    foreignKey: "submissionId",
    inverse: "submission",
  })
  declare documents?: NonAttribute<TravelAuthorizationPreApprovalDocument[]>

  @HasMany(() => TravelAuthorizationPreApproval, {
    foreignKey: "submissionId",
    inverse: "submission",
  })
  declare preApprovals?: NonAttribute<TravelAuthorizationPreApproval[]>

  static establishScopes() {
    // Add scopes here if needed
  }
}

export default TravelAuthorizationPreApprovalSubmission
