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
    field: "InvoiceID",
    allowNull: false,
    primaryKey: true,
  })
  declare id: CreationOptional<number>

  @Attribute({
    type: DataTypes.STRING(10),
    field: "InvoiceNumber",
    allowNull: false,
  })
  declare invoiceNumber: string

  @Attribute({
    type: DataTypes.STRING(10),
    field: "ProfileNumber",
    allowNull: true,
  })
  declare profileNumber: string | null

  @Attribute({
    type: DataTypes.STRING(50),
    field: "ProfileName",
    allowNull: true,
  })
  declare profileName: string | null

  @Attribute({
    type: DataTypes.STRING(30),
    field: "Department",
    allowNull: true,
  })
  declare department: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    field: "BookingDate",
    allowNull: true,
  })
  declare bookingDate: Date | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    field: "SystemDate",
    allowNull: true,
  })
  declare systemDate: Date | null

  @Attribute({
    type: DataTypes.STRING(50),
    field: "Description",
    allowNull: true,
  })
  declare description: string | null

  @Attribute({
    type: DataTypes.TEXT,
    field: "InvoiceRemarks",
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
