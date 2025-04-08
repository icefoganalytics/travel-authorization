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
} from "sequelize"

import sequelize from "@/db/db-client"

import TravelAuthorization from "./travel-authorization"

// Keep in sync with web/src/modules/travel-authorizations/components/ExpenseTypeSelect.vue
export enum ExpenseTypes {
  ACCOMMODATIONS = "Accommodations",
  TRANSPORTATION = "Transportation",
  MEALS_AND_INCIDENTALS = "Meals & Incidentals",
  NON_TRAVEL_STATUS = "Non-Travel Status",
}

export enum ExpenseCurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

// TODO: replace this with a boolean of isEstimate or
// move estimates to there own table.
// It's also possible that this is a single table inheritance model,
// and there should be two models, one for each "type".
export enum Types {
  ESTIMATE = "Estimate",
  EXPENSE = "Expense",
}

export class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
  static readonly Types = Types
  static readonly ExpenseTypes = ExpenseTypes
  static readonly CurrencyTypes = ExpenseCurrencyTypes

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare description: string
  declare date: Date | string | null // DATEONLY accepts Date or string, but returns string
  declare cost: number
  declare currency: ExpenseCurrencyTypes
  declare type: Types
  declare receiptImage: Buffer | null
  declare fileSize: number | null
  declare fileName: string | null
  declare expenseType: ExpenseTypes
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
    travelAuthorization: Association<Expense, TravelAuthorization>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
    })
  }
}

Expense.init(
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
      references: {
        model: "travel_authorizations", // using real table name here
        key: "id", // using real column name here
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(ExpenseCurrencyTypes)],
          msg: `Currency must be one of: ${Object.values(ExpenseCurrencyTypes).join(", ")}`,
        },
      },
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    receiptImage: {
      type: DataTypes.BLOB,
      allowNull: true,
      validate: {
        hasFileSize(value: Buffer | null) {
          if (value !== null && this.fileSize === null) {
            throw new Error("fileSize must be set when receiptImage is set")
          }
        },
      },
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        hasReceiptImage(value: number | null) {
          if (value !== null && this.receiptImage === null) {
            throw new Error("receiptImage must be set when fileSize is set")
          }
        },
      },
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expenseType: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    modelName: "Expense",
    tableName: "expenses",
    paranoid: false,
    // TODO: consider whether it would be better to use a separate table for uploads
    // e.g. Rails https://guides.rubyonrails.org/active_storage_overview.html
    defaultScope: {
      attributes: { exclude: ["receiptImage"] },
    },
    scopes: {
      withReceiptImage: {
        attributes: { include: ["receiptImage"] },
      },
    },
  }
)

export default Expense
