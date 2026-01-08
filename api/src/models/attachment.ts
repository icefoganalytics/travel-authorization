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
  Default,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import Expense from "@/models/expense"
import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

export enum AttachmentTargetTypes {
  Expense = "Expense",
  TravelDeskTravelRequest = "TravelDeskTravelRequest",
}

// TODO: Consider adding md5 field to Attachment model for integrity checks
// See: api/src/db/migrations/20250331154941_add-metadata-fields-to-travle-authorization-pre-approval-document.ts
@Table({
  defaultScope: {
    attributes: {
      exclude: ["content"],
    },
  },
})
export class Attachment extends Model<
  InferAttributes<Attachment>,
  InferCreationAttributes<Attachment>
> {
  static readonly TargetTypes = AttachmentTargetTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare targetId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(AttachmentTargetTypes)],
      msg: `Target type must be one of: ${Object.values(AttachmentTargetTypes).join(", ")}`,
    },
  })
  declare targetType: AttachmentTargetTypes

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare name: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare size: number

  @Attribute(DataTypes.BLOB)
  @NotNull
  declare content: Buffer

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare mimeType: string

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
  /**
   * Defined by {@link Expense#receipt}
   *
   * NOTE: lookup must include targetType or result will return a random model
   * @example
   * ```ts
   * const attachment = await Attachment.findOne({
   *   where: {
   *     targetType: Attachment.TargetTypes.Expense,
   *   },
   *   include: ["expense"],
   * })
   * ```
   */
  declare expense?: NonAttribute<Expense>

  /**
   * Defined by {@link TravelDeskTravelRequest#passengerNameRecordDocument}
   *
   * NOTE: lookup must include targetType or result will return a random model
   */
  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>

  get target(): NonAttribute<Expense | TravelDeskTravelRequest | undefined> {
    switch (this.targetType) {
      case AttachmentTargetTypes.Expense:
        return this.expense
      case AttachmentTargetTypes.TravelDeskTravelRequest:
        return this.travelDeskTravelRequest
      default:
        return undefined
    }
  }

  static establishScopes(): void {
    this.addScope("withContent", () => ({
      attributes: {
        include: ["content"],
      },
    }))
  }
}

export default Attachment
