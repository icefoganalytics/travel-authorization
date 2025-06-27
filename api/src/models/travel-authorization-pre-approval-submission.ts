import {
  DataTypes,
  Model,
  type Association,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

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

  declare id: CreationOptional<number>
  declare creatorId: ForeignKey<User["id"]>
  declare approverId: ForeignKey<User["id"]> | null
  declare approvedAt: Date | null
  declare rejectorId: ForeignKey<User["id"]> | null
  declare rejectedAt: Date | null
  declare status: TravelAuthorizationPreApprovalSubmissionStatuses
  declare department: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Associations
  declare approver?: NonAttribute<User>
  declare creator?: NonAttribute<User>
  declare documents?: NonAttribute<TravelAuthorizationPreApprovalDocument[]>
  declare preApprovals?: NonAttribute<TravelAuthorizationPreApproval[]>

  declare static associations: {
    approver: Association<TravelAuthorizationPreApprovalSubmission, User>
    creator: Association<TravelAuthorizationPreApprovalSubmission, User>
    documents: Association<
      TravelAuthorizationPreApprovalSubmission,
      TravelAuthorizationPreApprovalDocument
    >
    preApprovals: Association<
      TravelAuthorizationPreApprovalSubmission,
      TravelAuthorizationPreApproval
    >
  }

  static establishAssociations() {
    this.belongsTo(User, {
      as: "creator",
      foreignKey: "creatorId",
    })
    this.belongsTo(User, {
      as: "approver",
      foreignKey: "approverId",
    })
    this.hasMany(TravelAuthorizationPreApproval, {
      as: "preApprovals",
      foreignKey: "submissionId",
    })
    this.hasMany(TravelAuthorizationPreApprovalDocument, {
      as: "documents",
      foreignKey: "submissionId",
    })
  }
}

TravelAuthorizationPreApprovalSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelAuthorizationPreApprovalSubmissionStatuses)],
          msg: `Status must be one of: ${Object.values(TravelAuthorizationPreApprovalSubmissionStatuses).join(", ")}`,
        },
      },
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
  }
)

export default TravelAuthorizationPreApprovalSubmission
