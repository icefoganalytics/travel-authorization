import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import TravelAuthorization from "./travel-authorization"
import TravelDeskPassengerNameRecordDocument from "./travel-desk-passenger-name-record-document"
import TravelDeskTravelAgent from "./travel-desk-travel-agent"

import sequelize from "@/db/db-client"

export class TravelDeskTravelRequest extends Model<
  InferAttributes<TravelDeskTravelRequest>,
  InferCreationAttributes<TravelDeskTravelRequest>
> {
  declare requestID: CreationOptional<number>
  declare TAID: ForeignKey<TravelAuthorization["id"]>
  declare agencyID: ForeignKey<TravelDeskTravelAgent["agencyID"]>
  declare legalFirstName: string
  declare legalMiddleName: string | null
  declare legalLastName: string
  declare birthDate: string | null
  declare strAddress: string
  declare city: string
  declare province: string
  declare postalCode: string
  declare passportCountry: string | null
  declare passportNum: string | null
  declare travelPurpose: string
  declare travelLocation: string | null
  declare travelNotes: string | null
  declare busPhone: string
  declare busEmail: string
  declare travelContact: boolean | null
  declare travelPhone: string | null
  declare travelEmail: string | null
  declare additionalInformation: string | null
  declare status: string
  declare submitDate: Date | null
  declare travelDeskOfficer: string | null

  // Associations
  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorization: BelongsToGetAssociationMixin<TravelAuthorization>
  declare setTravelAuthorization: BelongsToSetAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare createTravelAuthorization: BelongsToCreateAssociationMixin<TravelAuthorization>

  declare getTravelDeskTravelAgent: BelongsToGetAssociationMixin<TravelDeskTravelAgent>
  declare setTravelDeskTravelAgent: BelongsToSetAssociationMixin<
    TravelDeskTravelAgent,
    TravelDeskTravelAgent["agencyID"]
  >
  declare createTravelDeskTravelAgent: BelongsToCreateAssociationMixin<TravelDeskTravelAgent>

  declare getTravelDeskPassengerNameRecordDocuments: HasManyGetAssociationsMixin<TravelDeskPassengerNameRecordDocument>
  declare setTravelDeskPassengerNameRecordDocuments: HasManySetAssociationsMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare hasTravelDeskPassengerNameRecordDocument: HasManyHasAssociationMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare hasTravelDeskPassengerNameRecordDocuments: HasManyHasAssociationsMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare addTravelDeskPassengerNameRecordDocument: HasManyAddAssociationMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare addTravelDeskPassengerNameRecordDocuments: HasManyAddAssociationsMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare removeTravelDeskPassengerNameRecordDocument: HasManyRemoveAssociationMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare removeTravelDeskPassengerNameRecordDocuments: HasManyRemoveAssociationsMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare countTravelDeskPassengerNameRecordDocuments: HasManyCountAssociationsMixin
  declare createTravelDeskPassengerNameRecordDocument: HasManyCreateAssociationMixin<TravelDeskPassengerNameRecordDocument>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare travelDeskTravelAgent?: NonAttribute<TravelDeskTravelAgent>
  declare travelDeskPassengerNameRecordDocuments?: NonAttribute<
    TravelDeskPassengerNameRecordDocument[]
  >

  declare static associations: {
    travelAuthorization: Association<TravelDeskTravelRequest, TravelAuthorization>
    travelDeskTravelAgent: Association<TravelDeskTravelRequest, TravelDeskTravelAgent>
    TravelDeskPassengerNameRecordDocument: Association<
      TravelDeskTravelRequest,
      TravelDeskPassengerNameRecordDocument
    >
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "TAID",
    })
    this.belongsTo(TravelDeskTravelAgent, {
      as: "travelDeskTravelAgent",
      foreignKey: "agencyID",
    })
  }
}

TravelDeskTravelRequest.init(
  {
    requestID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TAID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "travel_authorizations", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "CASCADE",
    },
    agencyID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "travelDeskTravelAgent", // using real table name here
        key: "agencyID", // using real column name here
      },
      onDelete: "SET NULL",
    },
    legalFirstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalMiddleName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    legalLastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    strAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    passportCountry: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passportNum: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelPurpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    travelLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    busPhone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    busEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    travelContact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    travelPhone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    additionalInformation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    submitDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    travelDeskOfficer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TravelDeskTravelRequest",
    tableName: "travelDeskTravelRequest",
    underscored: false,
    timestamps: false,
  }
)

export default TravelDeskTravelRequest
