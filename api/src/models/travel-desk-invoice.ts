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
  HasMany,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import { type BookingEventSnapshot } from "@/integrations/travelport-integration/models/booking-event-snapshot"
import TravelDeskInvoiceItem from "@/models/travel-desk-invoice-item"
import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

export type InvoiceSourceSnapshot = {
  bookingEvent: BookingEventSnapshot
  serviceFeeEvents: BookingEventSnapshot[]
}

const DECIMAL_AMOUNT_PATTERN = /^-?\d{1,15}(?:\.\d{1,3})?$/

export class TravelDeskInvoice extends Model<
  InferAttributes<TravelDeskInvoice>,
  InferCreationAttributes<TravelDeskInvoice>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelDeskTravelRequestId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare recordLocator: string

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare sourceBookingEventId: number

  @Attribute(DataTypes.JSONB)
  @NotNull
  declare sourceSnapshot: InvoiceSourceSnapshot

  @Attribute(DataTypes.STRING(3))
  @NotNull
  @ValidateAttribute({ is: /^[A-Z]{3}$/ })
  declare currencyCode: string

  @Attribute(DataTypes.STRING(255))
  declare invoiceNumber: string | null

  @Attribute({
    type: DataTypes.DATEONLY,
    set(value: string | null) {
      this.setDataValue("invoiceDate", value === "" ? null : value)
    },
  })
  declare invoiceDate: string | null

  @Attribute(DataTypes.STRING(255))
  declare warrantNumber: string | null

  @Attribute(DataTypes.STRING(255))
  declare clientNumber: string | null

  @Attribute(DataTypes.STRING(255))
  declare clientName: string | null

  @Attribute(DataTypes.STRING(255))
  declare department: string | null

  @Attribute(DataTypes.STRING(255))
  declare mailcode: string | null

  @Attribute(DataTypes.STRING(255))
  declare iataNumber: string | null

  @Attribute(DataTypes.STRING(255))
  declare bookingAgentName: string | null

  @Attribute(DataTypes.STRING(255))
  declare ticketingAgentName: string | null

  @Attribute({
    type: DataTypes.DATEONLY,
    set(value: string | null) {
      this.setDataValue("bookingDate", value === "" ? null : value)
    },
  })
  declare bookingDate: string | null

  @Attribute(DataTypes.DECIMAL(18, 3))
  @NotNull
  @ValidateAttribute({ is: DECIMAL_AMOUNT_PATTERN })
  declare grossAmount: string

  @Attribute(DataTypes.DATE)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null

  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: {
      name: "travelDeskTravelRequestId",
      onDelete: "RESTRICT",
    },
    inverse: {
      as: "invoices",
      type: "hasMany",
    },
  })
  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>

  @HasMany(() => TravelDeskInvoiceItem, {
    foreignKey: {
      name: "travelDeskInvoiceId",
      onDelete: "RESTRICT",
    },
    inverse: "invoice",
  })
  declare items?: NonAttribute<TravelDeskInvoiceItem[]>
}

export default TravelDeskInvoice
