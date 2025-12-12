import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy"

import { MssqlTypeExtensions } from "@/integrations/trav-com-integration/db/db-client"

import AccountsReceivableInvoice from "@/integrations/trav-com-integration/models/accounts-receivable-invoice"
import AccountsReceivableInvoiceDetail from "@/integrations/trav-com-integration/models/accounts-receivable-invoice-detail"
import City from "@/integrations/trav-com-integration/models/city"

export type SegmentNoHealthRaw = {
  segmentID: number
  invoiceID: number
  invoiceDetailID: number
  LegNumber: number
  DepartureCityCode: string | null
  DepartureInfo: string | null
  ArrivalCityCode: string | null
  ArrivalInfo: string | null
  AirlineCode: string | null
  FlightNumber: string | null
  ClassOfService: string | null
  FareBasis: string | null
}

@Table({
  tableName: "segmentsNoHealth",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class Segment extends Model<InferAttributes<Segment>, InferCreationAttributes<Segment>> {
  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "segmentID",
    allowNull: false,
    primaryKey: true,
  })
  declare id: number

  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "invoiceID",
    allowNull: false,
  })
  declare invoiceId: number

  @Attribute({
    type: DataTypes.DECIMAL(18, 0),
    columnName: "invoiceDetailID",
    allowNull: false,
  })
  declare invoiceDetailId: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LegNumber",
    allowNull: false,
  })
  declare legNumber: number

  @Attribute({
    type: DataTypes.STRING(5),
    columnName: "DepartureCityCode",
    allowNull: true,
  })
  declare departureCityCode: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "DepartureInfo",
    allowNull: true,
  })
  declare departureInfo: Date | null

  @Attribute({
    type: DataTypes.STRING(5),
    columnName: "ArrivalCityCode",
    allowNull: true,
  })
  declare arrivalCityCode: string | null

  @Attribute({
    type: MssqlTypeExtensions.DATETIME,
    columnName: "ArrivalInfo",
    allowNull: true,
  })
  declare arrivalInfo: Date | null

  @Attribute({
    type: DataTypes.STRING(3),
    columnName: "AirlineCode",
    allowNull: true,
  })
  declare airlineCode: string | null

  @Attribute({
    type: DataTypes.STRING(5),
    columnName: "FlightNumber",
    allowNull: true,
  })
  declare flightNumber: string | null

  @Attribute({
    type: DataTypes.STRING(2),
    columnName: "ClassOfService",
    allowNull: true,
  })
  declare classOfService: string | null

  @Attribute({
    type: DataTypes.STRING(15),
    columnName: "FareBasis",
    allowNull: true,
  })
  declare fareBasis: string | null

  // Associations
  @BelongsTo(() => City, {
    foreignKey: "arrivalCityCode",
    targetKey: "cityCode",
    inverse: {
      as: "segmentsAsArrivalCity",
      type: "hasMany",
    },
  })
  declare arrivalCity?: NonAttribute<City>

  @BelongsTo(() => City, {
    foreignKey: "departureCityCode",
    targetKey: "cityCode",
    inverse: {
      as: "segmentsAsDepartureCity",
      type: "hasMany",
    },
  })
  declare departureCity?: NonAttribute<City>

  @BelongsTo(() => AccountsReceivableInvoice, {
    foreignKey: "invoiceId",
    inverse: {
      as: "invoice",
      type: "hasMany",
    },
  })
  declare invoice?: NonAttribute<AccountsReceivableInvoice>

  @BelongsTo(() => AccountsReceivableInvoiceDetail, {
    foreignKey: "invoiceDetailId",
    inverse: {
      as: "segments",
      type: "hasMany",
    },
  })
  declare invoiceDetail?: NonAttribute<AccountsReceivableInvoiceDetail>

  static establishScopes(): void {
    // add as needed
  }
}

export default Segment
