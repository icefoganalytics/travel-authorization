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

import TravelDeskTravelRequest from "./travel-desk-travel-request"

import sequelize from "@/db/db-client"

export class TravelDeskPassengerNameRecordDocument extends Model<
  InferAttributes<TravelDeskPassengerNameRecordDocument>,
  InferCreationAttributes<TravelDeskPassengerNameRecordDocument>
> {
  declare id: CreationOptional<number>
  declare travelDeskTravelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare pnrDocument: Buffer | null
  declare invoiceNumber: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare getTravelDeskTravelRequest: BelongsToGetAssociationMixin<TravelDeskTravelRequest>
  declare setTravelDeskTravelRequest: BelongsToSetAssociationMixin<
    TravelDeskTravelRequest,
    TravelDeskTravelRequest["id"]
  >
  declare createTravelDeskTravelRequest: BelongsToCreateAssociationMixin<TravelDeskTravelRequest>

  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>

  declare static associations: {
    travelDeskTravelRequest: Association<
      TravelDeskPassengerNameRecordDocument,
      TravelDeskTravelRequest
    >
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      as: "travelDeskTravelRequest",
      targetKey: "id",
      foreignKey: "travelDeskTravelRequestId",
    })
  }
}

TravelDeskPassengerNameRecordDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    travelDeskTravelRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "travel_desk_travel_requests", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "CASCADE",
    },
    pnrDocument: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    modelName: "TravelDeskPassengerNameRecordDocument",
    tableName: "travel_desk_passenger_name_record_documents",
    paranoid: false,
  }
)

export default TravelDeskPassengerNameRecordDocument
