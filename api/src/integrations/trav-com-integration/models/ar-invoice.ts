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
import ArInvoiceDetail from "@/integrations/trav-com-integration/models/ar-invoice-detail"

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

export class ArInvoice extends Model<
  InferAttributes<ArInvoice>,
  InferCreationAttributes<ArInvoice>
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
  declare details?: NonAttribute<ArInvoiceDetail[]>

  declare static associations: {
    details: Association<ArInvoice, ArInvoiceDetail>
  }

  static establishAssociations() {
    this.hasMany(ArInvoiceDetail, {
      as: "details",
      foreignKey: "invoiceId",
    })
  }
}

ArInvoice.init(
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
      between([startDate, endDate]: [string, string]) {
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

export default ArInvoice
