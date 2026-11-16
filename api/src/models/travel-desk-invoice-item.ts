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
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelDeskFlightSegment from "@/models/travel-desk-flight-segment"
import TravelDeskInvoice from "@/models/travel-desk-invoice"

export enum TravelDeskInvoiceItemProductTypes {
  AIR = "air",
  SERVICE_FEE = "service_fee",
  CREDIT = "credit",
  CHANGE_FEE = "change_fee",
}

export enum TravelDeskInvoiceItemSaleTypes {
  SALE = "Sale",
  REFUND = "Refund",
  VOID = "Void",
}

export class TravelDeskInvoiceItem extends Model<
  InferAttributes<TravelDeskInvoiceItem>,
  InferCreationAttributes<TravelDeskInvoiceItem>
> {
  static ProductTypes = TravelDeskInvoiceItemProductTypes
  static SaleTypes = TravelDeskInvoiceItemSaleTypes

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelDeskInvoiceId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskInvoiceItemProductTypes)],
      msg: `Product type must be one of: ${Object.values(TravelDeskInvoiceItemProductTypes).join(", ")}`,
    },
  })
  declare productType: `${TravelDeskInvoiceItemProductTypes}`

  @Attribute(DataTypes.INTEGER)
  declare travelDeskFlightSegmentId: number | null

  @Attribute(DataTypes.INTEGER)
  declare sourceAirSegmentNumber: number | null

  @Attribute(DataTypes.INTEGER)
  declare sourceServiceFeeEventId: number | null

  @Attribute(DataTypes.STRING(255))
  declare passengerName: string | null

  @Attribute(DataTypes.STRING(255))
  declare ticketNumber: string | null

  @Attribute(DataTypes.STRING(255))
  declare vendor: string | null

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelDeskInvoiceItemSaleTypes)],
      msg: `Sale type must be one of: ${Object.values(TravelDeskInvoiceItemSaleTypes).join(", ")}`,
    },
  })
  declare saleType: `${TravelDeskInvoiceItemSaleTypes}`

  @Attribute(DataTypes.DECIMAL(18, 3))
  @NotNull
  declare grossAmount: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare position: number

  @Attribute(DataTypes.DATE)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null

  @BelongsTo(() => TravelDeskInvoice, {
    foreignKey: {
      name: "travelDeskInvoiceId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "items",
      type: "hasMany",
    },
  })
  declare invoice?: NonAttribute<TravelDeskInvoice>

  @BelongsTo(() => TravelDeskFlightSegment, {
    foreignKey: {
      name: "travelDeskFlightSegmentId",
      allowNull: true,
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "invoiceItems",
      type: "hasMany",
    },
  })
  declare flightSegment?: NonAttribute<TravelDeskFlightSegment>
}

export default TravelDeskInvoiceItem
