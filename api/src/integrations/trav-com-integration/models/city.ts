import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  NonAttribute,
  Association,
} from "sequelize"

import sequelize from "@/integrations/trav-com-integration/db/db-client"

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
export class City extends Model<InferAttributes<City>, InferCreationAttributes<City>> {
  declare cityType: number
  declare cityCode: string | null
  declare cityName: string
  declare country: string | null
  declare countryAbbreviation: string | null
  declare state: string | null
  declare region1: string | null
  declare region2: string | null
  declare latitudeDegrees: number
  declare latitudeMinutes: number
  declare latitudeSeconds: number
  declare latitudeDirection: string | null
  declare longitudeDegrees: number
  declare longitudeMinutes: number
  declare longitudeSeconds: number
  declare longitudeDirection: string | null

  // Associations
  declare accountsReceivableInvoiceDetails?: NonAttribute<AccountsReceivableInvoiceDetail[]>
  declare segmentsAsDepartureCity?: NonAttribute<Segment[]>
  declare segmentsAsArrivalCity?: NonAttribute<Segment[]>

  declare static associations: {
    accountsReceivableInvoiceDetails: Association<City, AccountsReceivableInvoiceDetail>
    segmentsAsDepartureCity: Association<City, Segment>
    segmentsAsArrivalCity: Association<City, Segment>
  }

  static establishAssociations() {
    this.hasMany(AccountsReceivableInvoiceDetail, {
      as: "accountsReceivableInvoiceDetails",
      foreignKey: "cityCode",
      sourceKey: "cityCode",
    })
    this.hasMany(Segment, {
      as: "segmentsAsDepartureCity",
      foreignKey: "departureCityCode",
      sourceKey: "cityCode",
    })
    this.hasMany(Segment, {
      as: "segmentsAsArrivalCity",
      foreignKey: "arrivalCityCode",
      sourceKey: "cityCode",
    })
  }
}

City.init(
  {
    cityType: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "CityType",
    },
    cityCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "CityCode",
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "CityName",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Country",
    },
    countryAbbreviation: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "CountryAbbr",
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "State",
    },
    region1: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Region1",
    },
    region2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Region2",
    },
    latitudeDegrees: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LatDeg",
    },
    latitudeMinutes: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LatMin",
    },
    latitudeSeconds: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LatSec",
    },
    latitudeDirection: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "LatDir",
    },
    longitudeDegrees: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LonDeg",
    },
    longitudeMinutes: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LonMin",
    },
    longitudeSeconds: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "LonSec",
    },
    longitudeDirection: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "LonDir",
    },
  },
  {
    sequelize,
    tableName: "Cities",
    underscored: false,
    timestamps: false,
    paranoid: false,
  }
)

// Workaround to tell Sequelize there is no primary key
// See https://sequelize.org/docs/v6/other-topics/legacy/#primary-keys
City.removeAttribute("id")

export default City
