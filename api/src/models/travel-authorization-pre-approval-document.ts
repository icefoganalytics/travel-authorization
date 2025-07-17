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
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import TravelAuthorizationPreApprovalSubmission from "@/models/travel-authorization-pre-approval-submission"

@Table({
  defaultScope: {
    attributes: {
      exclude: ["approvalDocument"],
    },
  },
})
export class TravelAuthorizationPreApprovalDocument extends Model<
  InferAttributes<TravelAuthorizationPreApprovalDocument>,
  InferCreationAttributes<TravelAuthorizationPreApprovalDocument>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare submissionId: number

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string

  @Attribute(DataTypes.BLOB)
  @NotNull
  declare approvalDocument: Buffer

  @Attribute(DataTypes.STRING)
  @NotNull
  declare approvalDocumentApproverName: string

  @Attribute(DataTypes.DATE)
  @NotNull
  declare approvalDocumentApprovedOn: Date

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare sizeInBytes: number

  @Attribute(DataTypes.STRING)
  @NotNull
  declare mimeType: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare md5: string

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
  @BelongsTo(() => TravelAuthorizationPreApprovalSubmission, {
    foreignKey: "submissionId",
    inverse: {
      as: "documents",
      type: "hasMany",
    },
  })
  declare submission?: NonAttribute<TravelAuthorizationPreApprovalSubmission>

  static establishScopes(): void {
    this.addScope("withDocument", () => ({
      attributes: {
        include: ["approvalDocument"],
      },
    }))
  }
}

export default TravelAuthorizationPreApprovalDocument
