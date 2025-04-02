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

import TravelAuthorizationPreApprovalSubmission from "@/models/travel-authorization-pre-approval-submission"
import TravelAuthorizationPreApprovalProfile from "@/models/travel-authorization-pre-approval-profile"

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

  declare id: CreationOptional<number>
  declare submissionId: ForeignKey<TravelAuthorizationPreApprovalSubmission["id"]> | null
  declare estimatedCost: number
  declare location: string
  declare department: string | null
  declare branch: string | null
  declare purpose: string | null
  declare reason: string | null
  declare startDate: Date | null
  declare endDate: Date | null
  declare isOpenForAnyDate: CreationOptional<boolean>
  declare month: string | null
  declare isOpenForAnyTraveler: CreationOptional<boolean>
  declare numberTravelers: number | null
  declare travelerNotes: string | null
  declare status: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Assocations
  declare profiles?: NonAttribute<TravelAuthorizationPreApprovalProfile[]>
  declare submission?: NonAttribute<TravelAuthorizationPreApprovalSubmission>

  declare static associations: {
    profiles: Association<TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile>
    submission: Association<
      TravelAuthorizationPreApproval,
      TravelAuthorizationPreApprovalSubmission
    >
  }

  static establishAssociations() {
    this.hasMany(TravelAuthorizationPreApprovalProfile, {
      as: "profiles",
      foreignKey: "preApprovalId",
    })
    this.belongsTo(TravelAuthorizationPreApprovalSubmission, {
      as: "submission",
      foreignKey: "submissionId",
    })
  }
}

TravelAuthorizationPreApproval.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TravelAuthorizationPreApprovalSubmission,
        key: "id",
      },
    },
    estimatedCost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isOpenForAnyDate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    month: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isOpenForAnyTraveler: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    numberTravelers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    travelerNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelAuthorizationPreApprovalStatuses)],
          msg: `Status must be one of: ${Object.values(TravelAuthorizationPreApprovalStatuses).join(", ")}`,
        },
      },
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
    indexes: [
      {
        unique: true,
        fields: ["submission_id"],
        name: "travel_authorization_pre_approvals_submission_id_unique",
        where: {
          submissionId: null,
          deletedAt: null,
        },
      },
    ],
    scopes: {
      availableForSubmission() {
        return {
          where: {
            submissionId: null,
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          },
        }
      },
    },
  }
)

export default TravelAuthorizationPreApproval
