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
  Index,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelAuthorizationPreApprovalSubmission from "@/models/travel-authorization-pre-approval-submission"
import TravelAuthorizationPreApprovalProfile from "@/models/travel-authorization-pre-approval-profile"
import User from "@/models/user"

/** Keep in sync with web/src/api/travel-authorization-pre-approvals-api.js */
// TODO: check if these status are on the correct model?
// I would expect these status to make more sense on the TravelAuthorizationPreApprovalSubmission.
// Or mabye the status would be something like "avaialable" and "used_up" based on the
// pre-approval profile usage.
export enum TravelAuthorizationPreApprovalStatuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  DECLINED = "declined",
}

export class TravelAuthorizationPreApproval extends Model<
  InferAttributes<TravelAuthorizationPreApproval>,
  InferCreationAttributes<TravelAuthorizationPreApproval>
> {
  static readonly Statuses = TravelAuthorizationPreApprovalStatuses

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.INTEGER)
  @Index({
    unique: true,
    name: "travel_authorization_pre_approvals_submission_id_unique",
    where: {
      submissionId: null,
      deletedAt: null,
    },
  })
  declare submissionId: number | null

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare estimatedCost: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare location: string

  @Attribute(DataTypes.STRING(255))
  declare department: string | null

  @Attribute(DataTypes.STRING(255))
  declare branch: string | null

  @Attribute(DataTypes.STRING(255))
  declare purpose: string | null

  @Attribute(DataTypes.STRING(255))
  declare reason: string | null

  @Attribute(DataTypes.DATE)
  declare startDate: Date | null

  @Attribute(DataTypes.DATE)
  declare endDate: Date | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isOpenForAnyDate: CreationOptional<boolean>

  @Attribute(DataTypes.STRING(255))
  declare month: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isOpenForAnyTraveler: CreationOptional<boolean>

  @Attribute(DataTypes.INTEGER)
  declare numberTravelers: number | null

  @Attribute(DataTypes.STRING(255))
  declare travelerNotes: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelAuthorizationPreApprovalStatuses)],
      msg: `Status must be one of: ${Object.values(TravelAuthorizationPreApprovalStatuses).join(", ")}`,
    },
  })
  declare status: string

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

  // Assocations
  @BelongsTo(() => User, {
    foreignKey: "creatorId",
    inverse: {
      as: "createdTravelAuthorizationPreApprovals",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @BelongsTo(() => TravelAuthorizationPreApprovalSubmission, {
    foreignKey: "submissionId",
    inverse: {
      as: "preApprovals",
      type: "hasMany",
    },
  })
  declare submission?: NonAttribute<TravelAuthorizationPreApprovalSubmission>

  @HasMany(() => TravelAuthorizationPreApprovalProfile, {
    foreignKey: "preApprovalId",
    inverse: "preApproval",
  })
  declare profiles?: NonAttribute<TravelAuthorizationPreApprovalProfile[]>

  static establishScopes(): void {
    this.addScope("availableForSubmission", () => {
      return {
        where: {
          submissionId: null,
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
        },
      }
    })
  }
}

export default TravelAuthorizationPreApproval
