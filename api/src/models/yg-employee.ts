import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize"

import sequelize from "@/db/db-client"

export class YgEmployee extends Model<
  InferAttributes<YgEmployee>,
  InferCreationAttributes<YgEmployee>
> {
  declare id: CreationOptional<number>
  declare email: string
  declare username: string
  declare fullName: string
  declare firstName: string
  declare lastName: string
  declare department: string
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare organization: string | null
  declare title: string | null
  declare suite: string | null
  declare phoneOffice: string | null
  declare faxOffice: string | null
  declare mobile: string | null
  declare office: string | null
  declare address: string | null
  declare poBox: string | null
  declare community: string | null
  declare postalCode: string | null
  declare latitude: string | null
  declare longitude: string | null
  declare mailcode: string | null
  declare manager: string | null
  declare lastSyncSuccessAt: Date | null
  declare lastSyncFailureAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null
}

YgEmployee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneOffice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    faxOffice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    office: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    poBox: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    community: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mailcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastSyncSuccessAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastSyncFailureAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
  }
)

export default YgEmployee
