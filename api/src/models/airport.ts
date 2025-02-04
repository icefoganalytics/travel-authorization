import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize"

import sequelize from "@/db/db-client"

/**
 * Relates to api/src/integrations/trav-com-integration/models/segment.ts from iataCode to arrivalCityCode and departureCityCode
 * This model might be replaced by an Internal Data Portal integration in the future.
 */
export class Airport extends Model<InferAttributes<Airport>, InferCreationAttributes<Airport>> {
  declare id: CreationOptional<number>
  declare ident: string
  declare name: string
  declare isoCountry: string
  declare continent: string | null
  declare municipality: string | null
  declare iataCode: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Associations
  static establishAssociations() {}
}

Airport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    ident: {
      type: DataTypes.STRING(4),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    continent: {
      type: DataTypes.STRING,
    },
    isoCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    municipality: {
      type: DataTypes.STRING,
    },
    iataCode: {
      type: DataTypes.STRING(3),
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

export default Airport
