import {
  DataTypes,
  Model,
  type Association,
  type CreationOptional,
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
export enum Statuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  DECLINED = "declined",
}

export class TravelAuthorizationPreApproval extends Model<
  InferAttributes<TravelAuthorizationPreApproval>,
  InferCreationAttributes<TravelAuthorizationPreApproval>
> {
  static readonly Statuses = Statuses

  declare id: CreationOptional<number>
  declare estimatedCost: number
  declare location: string
  declare department: CreationOptional<string | null>
  declare branch: CreationOptional<string | null>
  declare purpose: CreationOptional<string | null>
  declare reason: CreationOptional<string | null>
  declare startDate: CreationOptional<Date | null>
  declare endDate: CreationOptional<Date | null>
  declare isOpenForAnyDate: CreationOptional<boolean>
  declare month: CreationOptional<string | null>
  declare isOpenForAnyTraveler: CreationOptional<boolean>
  declare numberTravelers: CreationOptional<number | null>
  declare travelerNotes: CreationOptional<string | null>
  declare status: CreationOptional<string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Assocations
  declare profiles?: NonAttribute<TravelAuthorizationPreApprovalProfile[]>
  declare submissions?: NonAttribute<TravelAuthorizationPreApprovalSubmission[]>

  declare static associations: {
    profiles: Association<TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile>
    submissions: Association<
      TravelAuthorizationPreApproval,
      TravelAuthorizationPreApprovalSubmission
    >
  }

  static establishAssociations() {
    this.hasMany(TravelAuthorizationPreApprovalProfile, {
      as: "profiles",
      foreignKey: "preApprovalId",
    })
    this.hasMany(TravelAuthorizationPreApprovalSubmission, {
      as: "submissions",
      foreignKey: "preApprovalId",
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
      allowNull: true,
      defaultValue: false,
    },
    month: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isOpenForAnyTraveler: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(Statuses)],
          msg: `Status must be one of: ${Object.values(Statuses).join(", ")}`,
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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

export default TravelAuthorizationPreApproval
