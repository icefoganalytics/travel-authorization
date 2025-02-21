import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  literal,
  Model,
  NonAttribute,
  Op,
} from "sequelize"

import { compactSql } from "@/integrations/trav-com-integration/utils"
import sequelize from "@/integrations/trav-com-integration/db/db-client"

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

export class AccountsReceivableInvoiceDetail extends Model<
  InferAttributes<AccountsReceivableInvoiceDetail>,
  InferCreationAttributes<AccountsReceivableInvoiceDetail>
> {
  declare id: CreationOptional<number>
  declare invoiceId: ForeignKey<AccountsReceivableInvoice["id"]>
  declare transactionType: number
  declare vendorNumber: string
  declare vendorName: string
  declare productCode: number
  declare passengerName: string
  declare ticketNumber: string
  declare publishedFare: number
  declare sellingFare: number
  declare referenceFare: number
  declare lowFare: number
  declare tax1: number
  declare grossAmount: number
  declare commissionAmount: number
  declare vatOnCommission: number
  declare freeFieldA: string | null
  declare travelDate: string | null
  declare returnDate: string | null
  declare numberOfDays: number | null
  declare cityCode: string | null
  declare profileNumber: string | null
  declare addedBy: number

  // associations
  declare city?: NonAttribute<City>
  declare invoice?: NonAttribute<AccountsReceivableInvoice>
  declare segments?: NonAttribute<Segment[]>

  declare static associations: {
    city: Association<AccountsReceivableInvoiceDetail, City>
    invoice: Association<AccountsReceivableInvoiceDetail, AccountsReceivableInvoice>
    segments: Association<AccountsReceivableInvoiceDetail, Segment>
  }

  static establishAssociations() {
    this.belongsTo(City, {
      as: "city",
      foreignKey: "cityCode",
      targetKey: "cityCode",
    })
    this.belongsTo(AccountsReceivableInvoice, {
      as: "invoice",
      foreignKey: "invoiceId",
    })
    this.hasMany(Segment, {
      as: "segments",
      foreignKey: "invoiceDetailId",
    })
  }
}

AccountsReceivableInvoiceDetail.init(
  {
    id: {
      type: DataTypes.DECIMAL(18, 0),
      field: "InvoiceDetailID",
      primaryKey: true,
      allowNull: false,
    },
    invoiceId: {
      type: DataTypes.DECIMAL(18, 0),
      field: "InvoiceID",
      allowNull: false,
      references: {
        model: AccountsReceivableInvoice,
        key: "id",
      },
    },
    transactionType: {
      type: DataTypes.TINYINT,
      field: "TransactionType",
      allowNull: false,
    },
    vendorNumber: {
      type: DataTypes.STRING(8),
      field: "VendorNumber",
      allowNull: false,
    },
    vendorName: {
      type: DataTypes.STRING(50),
      field: "VendorName",
      allowNull: false,
    },
    productCode: {
      type: DataTypes.TINYINT,
      field: "ProductCode",
      allowNull: false,
    },
    passengerName: {
      type: DataTypes.STRING(50),
      field: "PassengerName",
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.STRING(20),
      field: "TicketNumber",
      allowNull: false,
    },
    publishedFare: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "PublishedFare",
      allowNull: false,
    },
    sellingFare: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "SellingFare",
      allowNull: false,
    },
    referenceFare: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "ReferenceFare",
      allowNull: false,
    },
    lowFare: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "LowFare",
      allowNull: false,
    },
    tax1: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "Tax1",
      allowNull: false,
    },
    grossAmount: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "GrossAmount",
      allowNull: false,
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "CommissionAmount",
      allowNull: false,
    },
    vatOnCommission: {
      type: DataTypes.DECIMAL(19, 4), // equivalent of type MONEY
      field: "VatOnCommission",
      allowNull: false,
    },
    freeFieldA: {
      type: DataTypes.TEXT,
      field: "FreeFieldA",
      allowNull: true,
    },
    travelDate: {
      type: DataTypes.DATE,
      field: "TravelDate",
      allowNull: true,
    },
    returnDate: {
      type: DataTypes.DATE,
      field: "ReturnDate",
      allowNull: true,
    },
    numberOfDays: {
      type: DataTypes.SMALLINT,
      field: "NumberOfDays",
      allowNull: true,
    },
    cityCode: {
      type: DataTypes.STRING(5),
      field: "CityCode",
      allowNull: true,
    },
    profileNumber: {
      type: DataTypes.STRING(10),
      field: "ProfileNumber",
      allowNull: true,
    },
    addedBy: {
      // Probably should be a foreign key to a "users" table.
      type: DataTypes.DECIMAL(18, 0),
      field: "AddedBy",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ARInvoiceDetailsNoHealth",
    underscored: false,
    timestamps: false,
    paranoid: false,
    scopes: {
      invoiceBookingDateBetween([startDate, endDate]: [string, string]) {
        return {
          include: {
            association: "invoice",
            where: {
              bookingDate: {
                [Op.between]: [startDate, endDate],
              },
            },
          },
        }
      },
      includeAgentNameAttribute() {
        const parentTableAlias = AccountsReceivableInvoiceDetail.name
        const agentNameQuery = compactSql(/* sql */ `
          COALESCE(
            (
              SELECT TOP 1
                VendorName
              FROM ARInvoiceDetailsNoHealth as agent_name_query
              WHERE agent_name_query.InvoiceID = ${parentTableAlias}.InvoiceID
                AND agent_name_query.ProductCode = 18
              ORDER BY agent_name_query.InvoiceDetailID ASC
            ),
            ${parentTableAlias}.VendorName
          )`)
        return {
          attributes: {
            include: [[literal(agentNameQuery), "agentName"]],
          },
        }
      },
    },
  }
)

export default AccountsReceivableInvoiceDetail
