import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy"

import TravelOrderEvent from "@/integrations/travelport-integration/models/travel-order-event"

@Table({
  tableName: "SFTrans",
  schema: "dbo",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class ServiceFeeTransaction extends Model<
  InferAttributes<ServiceFeeTransaction>,
  InferCreationAttributes<ServiceFeeTransaction>
> {
  @Attribute({
    type: DataTypes.INTEGER,
    columnName: "TravelOrderIdentifier",
    allowNull: false,
    primaryKey: true,
  })
  declare travelOrderIdentifier: number

  @Attribute({ type: DataTypes.CHAR(1), columnName: "SFActiveVoidStatus", allowNull: true })
  declare activeVoidStatus: string | null

  @Attribute({ type: DataTypes.CHAR(13), columnName: "SFDocumentNbr", allowNull: true })
  declare serviceFeeDocumentNumber: string | null

  @Attribute({ type: DataTypes.STRING(55), columnName: "NameOnServiceFee", allowNull: true })
  declare nameOnServiceFee: string | null

  @Attribute({ type: DataTypes.CHAR(10), columnName: "SFIssueDate", allowNull: true })
  declare issueDate: string | null

  @Attribute({ type: DataTypes.CHAR(3), columnName: "SFCurrencyCode", allowNull: true })
  declare currencyCode: string | null

  // Preserve source DECIMAL(18,3) values as strings instead of rounding through JS numbers.
  @Attribute({ type: DataTypes.DECIMAL(18, 3), columnName: "ServiceFeeAmount", allowNull: true })
  declare serviceFeeAmount: string | null

  @Attribute({ type: DataTypes.DECIMAL(18, 3), columnName: "SFCommissionAmount", allowNull: true })
  declare commissionAmount: string | null

  @Attribute({ type: DataTypes.CHAR(13), columnName: "RelatedTicketDocumentNbr", allowNull: true })
  declare relatedTicketDocumentNumber: string | null

  @Attribute({ type: DataTypes.STRING(10), columnName: "RelatedInvoiceNbr", allowNull: true })
  declare relatedInvoiceNumber: string | null

  @Attribute({ type: DataTypes.CHAR(6), columnName: "RecordLocator", allowNull: true })
  declare recordLocator: string | null

  @BelongsTo(() => TravelOrderEvent, {
    foreignKey: "travelOrderIdentifier",
    targetKey: "travelOrderIdentifier",
    inverse: { as: "serviceFeeTransaction", type: "hasOne" },
  })
  declare travelOrderEvent?: NonAttribute<TravelOrderEvent>
}

export default ServiceFeeTransaction
