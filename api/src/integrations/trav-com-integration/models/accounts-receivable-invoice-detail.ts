import {
  DataTypes,
  Op,
  sql,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, BelongsTo, HasMany, Table } from "@sequelize/core/decorators-legacy"
import { sortBy } from "lodash"

import BaseModel from "@/models/base-model"
import { FlightReconciliation } from "@/models"
import { MssqlTypeExtensions } from "@/integrations/trav-com-integration/db/db-client"

import AccountsReceivableInvoice from "@/integrations/trav-com-integration/models/accounts-receivable-invoice"
import City from "@/integrations/trav-com-integration/models/city"
import Segment from "@/integrations/trav-com-integration/models/segment"

export type ArInvoiceDetailNoHealthRaw = {
  InvoiceDetailID: number
  InvoiceID: number
  TransactionType: number
  VendorNumber: string
  VendorName: string
  ProductCode: number
  PassengerName: string
  TicketNumber: string
  PublishedFare: number
  SellingFare: number
  ReferenceFare: number
  LowFare: number
  Tax1: number
  GrossAmount: number
  CommissionAmount: number
  VatOnCommission: number
  FreeFieldA: string | null
  TravelDate: string | null
  ReturnDate: string | null
  NumberOfDays: number | null
  CityCode: string | null
  ProfileNumber: string | null
  AddedBy: number
}

@Table({
  tableName: "ARInvoiceDetailsNoHealth",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class AccountsReceivableInvoiceDetail extends BaseModel<
  InferAttributes<AccountsReceivableInvoiceDetail>,
  InferCreationAttributes<AccountsReceivableInvoiceDetail>
> {
  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "InvoiceDetailID",
    primaryKey: true,
    allowNull: false,
  })
  declare id: CreationOptional<number>

  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "InvoiceID",
    allowNull: false,
  })
  declare invoiceId: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "TransactionType",
    allowNull: false,
  })
  declare transactionType: number

  @Attribute({
    type: DataTypes.STRING(8),
    columnName: "VendorNumber",
    allowNull: false,
  })
  declare vendorNumber: string

  @Attribute({
    type: DataTypes.STRING(50),
    columnName: "VendorName",
    allowNull: false,
  })
  declare vendorName: string

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "ProductCode",
    allowNull: false,
  })
  declare productCode: number

  @Attribute({
    type: DataTypes.STRING(50),
    columnName: "PassengerName",
    allowNull: false,
  })
  declare passengerName: string

  @Attribute({
    type: DataTypes.STRING(20),
    columnName: "TicketNumber",
    allowNull: false,
  })
  declare ticketNumber: string

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "PublishedFare",
    allowNull: false,
  })
  declare publishedFare: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "SellingFare",
    allowNull: false,
  })
  declare sellingFare: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "ReferenceFare",
    allowNull: false,
  })
  declare referenceFare: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "LowFare",
    allowNull: false,
  })
  declare lowFare: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "Tax1",
    allowNull: false,
  })
  declare tax1: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "GrossAmount",
    allowNull: false,
  })
  declare grossAmount: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "CommissionAmount",
    allowNull: false,
  })
  declare commissionAmount: number

  @Attribute({
    type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
    columnName: "VatOnCommission",
    allowNull: false,
  })
  declare vatOnCommission: number

  @Attribute({
    type: DataTypes.TEXT,
    columnName: "FreeFieldA",
    allowNull: true,
  })
  declare freeFieldA: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "TravelDate",
    allowNull: true,
  })
  declare travelDate: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "ReturnDate",
    allowNull: true,
  })
  declare returnDate: string | null

  @Attribute({
    type: DataTypes.SMALLINT,
    columnName: "NumberOfDays",
    allowNull: true,
  })
  declare numberOfDays: number | null

  @Attribute({
    type: DataTypes.STRING(5),
    columnName: "CityCode",
    allowNull: true,
  })
  declare cityCode: string | null

  @Attribute({
    type: DataTypes.STRING(10),
    columnName: "ProfileNumber",
    allowNull: true,
  })
  declare profileNumber: string | null

  // Probably should be a foreign key to a "users" table.
  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "AddedBy",
    allowNull: false,
  })
  declare addedBy: number

  // Associations
  @BelongsTo(() => City, {
    foreignKey: "cityCode",
    targetKey: "cityCode",
    inverse: {
      as: "accountsReceivableInvoiceDetails",
      type: "hasMany",
    },
  })
  declare city?: NonAttribute<City>

  @BelongsTo(() => AccountsReceivableInvoice, {
    foreignKey: "invoiceId",
    inverse: {
      as: "details",
      type: "hasMany",
    },
  })
  declare invoice?: NonAttribute<AccountsReceivableInvoice>

  @HasMany(() => Segment, {
    foreignKey: "invoiceDetailId",
    inverse: "invoiceDetail",
  })
  declare segments?: NonAttribute<Segment[]>

  // External association, you cannot eager load this
  declare flightReconciliation?: NonAttribute<FlightReconciliation>

  static establishScopes(): void {
    this.addScope("invoiceBookingDateBetween", ([date1, date2]: [string, string]) => {
      const [startDate, endDate] = sortBy([date1, date2])

      return {
        include: {
          association: "invoice",
          where: {
            bookingDate: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          },
        },
      }
    })
    this.addScope("includeAgentNameAttribute", () => {
      const parentTableAlias = sql.identifier(AccountsReceivableInvoiceDetail.name)
      const agentNameQuery = sql`
        COALESCE(
          (
            SELECT
              TOP 1 VendorName
            FROM
              ARInvoiceDetailsNoHealth as agent_name_query
            WHERE
              agent_name_query.InvoiceID = ${parentTableAlias}.InvoiceID
              AND agent_name_query.ProductCode = 18
            ORDER BY
              agent_name_query.InvoiceDetailID ASC
          ),
          ${parentTableAlias}.VendorName
        )
      `
      return {
        attributes: {
          include: [[agentNameQuery, "agentName"]],
        },
      }
    })
  }
}

export default AccountsReceivableInvoiceDetail
