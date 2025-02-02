import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
} from "sequelize"

import sequelize from "@/integrations/trav-com-integration/db/db-client"
import ArInvoice from "@/integrations/trav-com-integration/models/ar-invoice"

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

export class ArInvoiceDetail extends Model<
  InferAttributes<ArInvoiceDetail>,
  InferCreationAttributes<ArInvoiceDetail>
> {
  declare id: CreationOptional<number>
  declare invoiceId: ForeignKey<ArInvoice["id"]>
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
  declare invoice?: NonAttribute<ArInvoice>

  declare static associations: {
    invoice: Association<ArInvoiceDetail, ArInvoice>
  }

  static establishAssociations() {
    this.belongsTo(ArInvoice, {
      as: "invoice",
      foreignKey: "invoiceId",
    })
  }
}

ArInvoiceDetail.init(
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
        model: ArInvoice,
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
    },
  }
)

export default ArInvoiceDetail
