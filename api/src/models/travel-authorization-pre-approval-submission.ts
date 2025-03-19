import {
  DataTypes,
  Model,
  type Association,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize"

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
  FINISHED = "finished",
}

export class TravelAuthorizationPreApprovalSubmission extends Model<
  InferAttributes<TravelAuthorizationPreApprovalSubmission>,
  InferCreationAttributes<TravelAuthorizationPreApprovalSubmission>
> {
  static readonly Statuses = TravelAuthorizationPreApprovalSubmissionStatuses

  declare id: CreationOptional<number>
  declare preApprovalId: ForeignKey<TravelAuthorizationPreApproval["id"]>
  declare creatorId: ForeignKey<User["id"]>
  declare approverId: ForeignKey<User["id"]>
  declare approvedAt: Date | null
  declare status: TravelAuthorizationPreApprovalSubmissionStatuses
  declare department: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Associations
  declare approver?: NonAttribute<User>
  declare creator?: NonAttribute<User>
  declare documents?: NonAttribute<TravelAuthorizationPreApprovalDocument[]>
  declare preApproval?: NonAttribute<TravelAuthorizationPreApproval>

  declare static associations: {
    approver: Association<TravelAuthorizationPreApprovalSubmission, User>
    creator: Association<TravelAuthorizationPreApprovalSubmission, User>
    documents: Association<
      TravelAuthorizationPreApprovalSubmission,
      TravelAuthorizationPreApprovalDocument
    >
    preApproval: Association<
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
    this.belongsTo(TravelAuthorizationPreApproval, {
      as: "preApproval",
      foreignKey: "preApprovalId",
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
    preApprovalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelAuthorizationPreApproval,
        key: "id",
      },
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
