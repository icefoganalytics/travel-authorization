import {
  DataTypes,
  Model,
  Op,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, HasMany, Table } from "@sequelize/core/decorators-legacy"

import { MssqlTypeExtensions } from "@/integrations/trav-com-integration/db/db-client"

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

@Table({
  tableName: "ARInvoicesNoHealth",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class AccountsReceivableInvoice extends Model<
  InferAttributes<AccountsReceivableInvoice>,
  InferCreationAttributes<AccountsReceivableInvoice>
> {
  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "InvoiceID",
    allowNull: false,
    primaryKey: true,
  })
  declare id: CreationOptional<number>

  @Attribute({
    type: DataTypes.STRING(10),
    columnName: "InvoiceNumber",
    allowNull: false,
  })
  declare invoiceNumber: string

  @Attribute({
    type: DataTypes.STRING(10),
    columnName: "ProfileNumber",
    allowNull: true,
  })
  declare profileNumber: string | null

  @Attribute({
    type: DataTypes.STRING(50),
    columnName: "ProfileName",
    allowNull: true,
  })
  declare profileName: string | null

  @Attribute({
    type: DataTypes.STRING(30),
    columnName: "Department",
    allowNull: true,
  })
  declare department: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "BookingDate",
    allowNull: true,
  })
  declare bookingDate: Date | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "SystemDate",
    allowNull: true,
  })
  declare systemDate: Date | null

  @Attribute({
    type: DataTypes.STRING(50),
    columnName: "Description",
    allowNull: true,
  })
  declare description: string | null

  @Attribute({
    type: DataTypes.TEXT,
    columnName: "InvoiceRemarks",
    allowNull: true,
  })
  declare invoiceRemarks: string | null

  // Associations
  @HasMany(() => AccountsReceivableInvoiceDetail, {
    foreignKey: "invoiceId",
    inverse: "invoice",
  })
  declare details?: NonAttribute<AccountsReceivableInvoiceDetail[]>

  @HasMany(() => Segment, {
    foreignKey: "invoiceId",
    inverse: "invoice",
  })
  declare segments?: NonAttribute<Segment[]>

  static establishScopes(): void {
    this.addScope("bookingDateBetween", ([startDate, endDate]: [string, string]) => {
      return {
        where: {
          bookingDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    })
  }
}

export default AccountsReceivableInvoice
