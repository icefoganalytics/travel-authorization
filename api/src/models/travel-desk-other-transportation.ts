import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  NonAttribute,
  DataTypes,
} from "@sequelize/core"

import sequelize from "@/db/db-client"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

/**
 * Keep in sync with web/src/api/travel-desk-other-transportations-api.js
 * TODO: normalizes these to snake_case
 */
export enum TravelDeskOtherTransportationStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/**
 * Keep in sync with web/src/api/travel-desk-other-transportations-api.js
 * TODO: normalizes these to snake_case
 */
export enum TransportationTypes {
  SHUTTLE = "Shuttle",
  BUS = "Bus",
  TRAIN = "Train",
}

export class TravelDeskOtherTransportation extends Model<
  InferAttributes<TravelDeskOtherTransportation>,
  InferCreationAttributes<TravelDeskOtherTransportation>
> {
  static readonly Statuses = TravelDeskOtherTransportationStatuses
  static readonly TransportationTypes = TransportationTypes

  declare id: CreationOptional<number>
  declare travelRequestId: ForeignKey<TravelDeskTravelRequest["id"]>
  declare depart: string
  declare arrive: string
  declare transportationType: string
  declare date: Date | string // DATEONLY accepts Date or string, but returns string
  declare additionalNotes: CreationOptional<string | null>
  declare status: string
  // NOTE: reserved_transportation_info, and booking do not appear to be used in the codebase.
  declare reservedTransportationInfo: CreationOptional<string | null>
  declare booking: CreationOptional<string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Associations
  declare getTravelRequest: BelongsToGetAssociationMixin<TravelDeskTravelRequest>
  declare setTravelRequest: BelongsToSetAssociationMixin<
    TravelDeskTravelRequest,
    TravelDeskTravelRequest["id"]
  >
  declare createTravelRequest: BelongsToCreateAssociationMixin<TravelDeskTravelRequest>

  declare travelRequest: NonAttribute<TravelDeskTravelRequest>

  declare static associations: {
    travelRequest: Association<TravelDeskOtherTransportation, TravelDeskTravelRequest>
  }

  static establishAssociations() {
    this.belongsTo(TravelDeskTravelRequest, {
      as: "travelRequest",
      foreignKey: "travelRequestId",
    })
  }
}

TravelDeskOtherTransportation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    travelRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelDeskTravelRequest,
        key: "id",
      },
    },
    depart: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    arrive: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    transportationType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TransportationTypes)],
          msg: `Transportation type must be one of the following: ${Object.values(
            TransportationTypes
          ).join(", ")}`,
        },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    additionalNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TravelDeskOtherTransportationStatuses)],
          msg: `Status must be one of the following: ${Object.values(
            TravelDeskOtherTransportationStatuses
          ).join(", ")}`,
        },
      },
    },
    reservedTransportationInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    booking: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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

export default TravelDeskOtherTransportation
