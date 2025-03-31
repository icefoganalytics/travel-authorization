import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import TravelAuthorizationPreApprovalSubmission from "@/models/travel-authorization-pre-approval-submission"

export class TravelAuthorizationPreApprovalDocument extends Model<
  InferAttributes<TravelAuthorizationPreApprovalDocument>,
  InferCreationAttributes<TravelAuthorizationPreApprovalDocument>
> {
  declare id: CreationOptional<number>
  declare submissionId: ForeignKey<TravelAuthorizationPreApprovalSubmission["id"]>
  declare name: string
  declare approvalDocument: Buffer
  declare sizeInBytes: number
  declare mimetype: string
  declare md5: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Associations
  declare submission?: NonAttribute<TravelAuthorizationPreApprovalSubmission>

  declare static associations: {
    submission: Association<
      TravelAuthorizationPreApprovalDocument,
      TravelAuthorizationPreApprovalSubmission
    >
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorizationPreApprovalSubmission, {
      as: "submission",
      foreignKey: "submissionId",
    })
  }
}

TravelAuthorizationPreApprovalDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelAuthorizationPreApprovalSubmission,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvalDocument: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    sizeInBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    md5: {
      type: DataTypes.STRING,
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

export default TravelAuthorizationPreApprovalDocument
