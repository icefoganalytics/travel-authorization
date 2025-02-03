import {
  Association,
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
} from "sequelize"

import sequelize from "@/integrations/trav-com-integration/db/db-client"

import AccountsReceivableInvoiceDetail from "@/integrations/trav-com-integration/models/accounts-receivable-invoice-detail"
import Segment from "@/integrations/trav-com-integration/models/segment"

export type ArInvoiceNoHealthRaw = {
  InvoiceID: number
  InvoiceNumber: string
  ProfileNumber: string | null
  ProfileName: string | null
  Department: string | null
  BookingDate: string | null
  SystemDate: string | null
  Description: string | null
  InvoiceRemarks: string | null
}

export class AccountsReceivableInvoice extends Model<
  InferAttributes<AccountsReceivableInvoice>,
  InferCreationAttributes<AccountsReceivableInvoice>
> {
  declare id: CreationOptional<number>
  declare invoiceNumber: string
  declare profileNumber: string | null
  declare profileName: string | null
  declare department: string | null
  declare bookingDate: string | null
  declare systemDate: string | null
  declare description: string | null
  declare invoiceRemarks: string | null

  // associations
  declare details?: NonAttribute<AccountsReceivableInvoiceDetail[]>
  declare segments?: NonAttribute<Segment[]>

  declare static associations: {
    details: Association<AccountsReceivableInvoice, AccountsReceivableInvoiceDetail>
    segments: Association<AccountsReceivableInvoice, Segment>
  }

  static establishAssociations() {
    this.hasMany(AccountsReceivableInvoiceDetail, {
      as: "details",
      foreignKey: "invoiceId",
    })
    this.hasMany(Segment, {
      as: "segments",
      foreignKey: "invoiceId",
    })
  }
}

AccountsReceivableInvoice.init(
  {
    id: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      field: "InvoiceID",
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "InvoiceNumber",
    },
    profileNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "ProfileNumber",
    },
    profileName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ProfileName",
    },
    department: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "Department",
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "BookingDate",
    },
    systemDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "SystemDate",
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "Description",
    },
    invoiceRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "InvoiceRemarks",
    },
  },
  {
    sequelize,
    tableName: "ARInvoicesNoHealth",
    underscored: false,
    timestamps: false,
    paranoid: false,
    scopes: {
      bookingDateBetween([startDate, endDate]: [string, string]) {
        return {
          where: {
            bookingDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        }
      },
    },
  }
)

export default AccountsReceivableInvoice
