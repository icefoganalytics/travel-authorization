import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, HasMany, Table } from "@sequelize/core/decorators-legacy"

import AccountsReceivableInvoiceDetail from "@/integrations/trav-com-integration/models/accounts-receivable-invoice-detail"
import Segment from "@/integrations/trav-com-integration/models/segment"

export type CityRaw = {
  CityType: number
  CityCode: string | null
  CityName: string
  Country: string | null
  CountryAbbr: string | null
  State: string | null
  Region1: string | null
  Region2: string | null
  LatDeg: number
  LatMin: number
  LatSec: number
  LatDir: string | null
  LonDeg: number
  LonMin: number
  LonSec: number
  LonDir: string | null
}

/**
 * Note table does not have a primary key.
 * Only recognizably unique field, CityCode, is nullable.
 */
@Table({
  tableName: "Cities",
  underscored: false,
  timestamps: false,
  paranoid: false,
  noPrimaryKey: true,
})
export class City extends Model<InferAttributes<City>, InferCreationAttributes<City>> {
  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "CityType",
    allowNull: false,
  })
  declare cityType: number

  @Attribute({
    type: DataTypes.STRING(5),
    columnName: "CityCode",
    allowNull: true,
  })
  declare cityCode: string | null

  @Attribute({
    type: DataTypes.STRING,
    columnName: "CityName",
    allowNull: false,
  })
  declare cityName: string

  @Attribute({
    type: DataTypes.STRING,
    columnName: "Country",
    allowNull: true,
  })
  declare country: string | null

  @Attribute({
    type: DataTypes.STRING,
    columnName: "CountryAbbr",
    allowNull: true,
  })
  declare countryAbbreviation: string | null

  @Attribute({
    type: DataTypes.STRING,
    columnName: "State",
    allowNull: true,
  })
  declare state: string | null

  @Attribute({
    type: DataTypes.STRING,
    columnName: "Region1",
    allowNull: true,
  })
  declare region1: string | null

  @Attribute({
    type: DataTypes.STRING,
    columnName: "Region2",
    allowNull: true,
  })
  declare region2: string | null

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LatDeg",
    allowNull: false,
  })
  declare latitudeDegrees: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LatMin",
    allowNull: false,
  })
  declare latitudeMinutes: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LatSec",
    allowNull: false,
  })
  declare latitudeSeconds: number

  @Attribute({
    type: DataTypes.STRING,
    columnName: "LatDir",
    allowNull: true,
  })
  declare latitudeDirection: string | null

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LonDeg",
    allowNull: false,
  })
  declare longitudeDegrees: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LonMin",
    allowNull: false,
  })
  declare longitudeMinutes: number

  @Attribute({
    type: DataTypes.TINYINT,
    columnName: "LonSec",
    allowNull: false,
  })
  declare longitudeSeconds: number

  @Attribute({
    type: DataTypes.STRING,
    columnName: "LonDir",
    allowNull: true,
  })
  declare longitudeDirection: string | null

  // Associations
  @HasMany(() => AccountsReceivableInvoiceDetail, {
    foreignKey: "cityCode",
    sourceKey: "cityCode",
    inverse: "city",
  })
  declare accountsReceivableInvoiceDetails?: NonAttribute<AccountsReceivableInvoiceDetail[]>

  @HasMany(() => Segment, {
    foreignKey: "departureCityCode",
    sourceKey: "cityCode",
    inverse: "departureCity",
  })
  declare segmentsAsDepartureCity?: NonAttribute<Segment[]>

  @HasMany(() => Segment, {
    foreignKey: "arrivalCityCode",
    sourceKey: "cityCode",
    inverse: "arrivalCity",
  })
  declare segmentsAsArrivalCity?: NonAttribute<Segment[]>

  static establishScopes(): void {
    // add as needed
  }
}

export default City
