import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

import TravelAuthorization from "./travel-authorization"

export class GeneralLedgerCoding extends Model<
  InferAttributes<GeneralLedgerCoding>,
  InferCreationAttributes<GeneralLedgerCoding>
> {
  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare code: string
  declare amount: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorization: BelongsToGetAssociationMixin<TravelAuthorization>
  declare setTravelAuthorization: BelongsToSetAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare createTravelAuthorization: BelongsToCreateAssociationMixin<TravelAuthorization>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  declare static associations: {
    travelAuthorization: Association<GeneralLedgerCoding, TravelAuthorization>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
      onDelete: "CASCADE",
    })
  }
}

GeneralLedgerCoding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    travelAuthorizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // See https://www.tpsgc-pwgsc.gc.ca/recgen/pceaf-gwcoa/2223/2-eng.html
    // Department / Agency 	Financial Reporting Account (FRA) 	Authority 	Program 	Object 	Transaction Type
    code: {
      type: DataTypes.STRING(26),
      allowNull: false,
      validate: {
        is: {
          args: /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{6}-\d{4}(?:-[a-zA-Z0-9]{1,4}(?:-[a-zA-Z0-9]{1,5})?)?$/,
          msg: "Code must be in the format: vote (3 characters) - Program (6 characters) - object code (4 digits) - subledger-1 (0-4 characters) - subleger-2 (0-5 characters)",
        },
      },
    },
    // Postgres decimal types are represented as strings, so much be converted to numbers JS side.
    // See https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue("amount")
        if (value === null) return null

        return Number(value)
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    paranoid: false,
  }
)

export default GeneralLedgerCoding
