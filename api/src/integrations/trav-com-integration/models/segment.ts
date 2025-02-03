import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/integrations/trav-com-integration/db/db-client"

import AccountsReceivableInvoice from "@/integrations/trav-com-integration/models/accounts-receivable-invoice"
import AccountsReceivableInvoiceDetail from "@/integrations/trav-com-integration/models/accounts-receivable-invoice-detail"

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

export class Segment extends Model<InferAttributes<Segment>, InferCreationAttributes<Segment>> {
  declare id: CreationOptional<number>
  declare invoiceId: ForeignKey<AccountsReceivableInvoice["id"]>
  declare invoiceDetailId: ForeignKey<AccountsReceivableInvoiceDetail["id"]>
  declare legNumber: number
  declare departureCityCode: string | null
  declare departureInfo: string | null
  declare arrivalCityCode: string | null
  declare arrivalInfo: string | null
  declare airlineCode: string | null
  declare flightNumber: string | null
  declare classOfService: string | null
  declare fareBasis: string | null

  // associations
  declare invoice?: NonAttribute<AccountsReceivableInvoice>
  declare invoiceDetail?: NonAttribute<AccountsReceivableInvoiceDetail>

  declare static associations: {
    invoice: Association<Segment, AccountsReceivableInvoice>
    invoiceDetail: Association<Segment, AccountsReceivableInvoiceDetail>
  }

  static establishAssociations() {
    this.belongsTo(AccountsReceivableInvoice, {
      as: "invoice",
      foreignKey: "invoiceId",
    })
    this.belongsTo(AccountsReceivableInvoiceDetail, {
      as: "invoiceDetail",
      foreignKey: "invoiceDetailId",
    })
  }
}

Segment.init(
  {
    id: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      primaryKey: true,
      field: "segmentID",
    },
    invoiceId: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      field: "invoiceID",
      references: {
        model: AccountsReceivableInvoice,
        key: "id",
      },
    },
    invoiceDetailId: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      field: "invoiceDetailID",
      references: {
        model: AccountsReceivableInvoiceDetail,
        key: "id",
      },
    },
    legNumber: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: "LegNumber",
    },
    departureCityCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "DepartureCityCode",
    },
    departureInfo: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "DepartureInfo",
    },
    arrivalCityCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "ArrivalCityCode",
    },
    arrivalInfo: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "ArrivalInfo",
    },
    airlineCode: {
      type: DataTypes.STRING(3),
      allowNull: true,
      field: "AirlineCode",
    },
    flightNumber: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "FlightNumber",
    },
    classOfService: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: "ClassOfService",
    },
    fareBasis: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "FareBasis",
    },
  },
  {
    sequelize,
    tableName: "segmentsNoHealth",
    underscored: false,
    timestamps: false,
    paranoid: false,
  }
)

export default Segment
