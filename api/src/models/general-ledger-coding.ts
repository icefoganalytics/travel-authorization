import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"

import TravelAuthorization from "@/models/travel-authorization"

@Table({
  paranoid: false,
})
export class GeneralLedgerCoding extends Model<
  InferAttributes<GeneralLedgerCoding>,
  InferCreationAttributes<GeneralLedgerCoding>
> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelAuthorizationId: number

  @Attribute(DataTypes.STRING(26))
  @NotNull
  @ValidateAttribute({
    // See https://www.tpsgc-pwgsc.gc.ca/recgen/pceaf-gwcoa/2223/2-eng.html
    // Department / Agency 	Financial Reporting Account (FRA) 	Authority 	Program 	Object 	Transaction Type
    is: {
      args: /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{6}-\d{4}(?:-[a-zA-Z0-9]{1,4}(?:-[a-zA-Z0-9]{1,5})?)?$/,
      msg: "Code must be in the format: vote (3 characters) - Program (6 characters) - object code (4 digits) - subledger-1 (0-4 characters) - subleger-2 (0-5 characters)",
    },
  })
  declare code: string

  @Attribute({
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // Postgres decimal types are represented as strings, so much be converted to numbers JS side.
    // See https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
    get() {
      const value = this.getDataValue("amount")
      if (value === null) return null

      return Number(value)
    },
  })
  declare amount: number

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // Associations
  @BelongsTo(() => TravelAuthorization, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "generalLedgerCodings",
      type: "hasMany",
    },
  })
  declare travelAuthorization?: NonAttribute<TravelAuthorization>

  static establishScopes(): void {
    // add as needed
  }
}

export default GeneralLedgerCoding
