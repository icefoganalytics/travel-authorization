import { isNil } from "lodash"
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

import Location from "@/models/location"
import TravelAuthorization from "@/models/travel-authorization"
import TravelSegment from "@/models/travel-segment"

/*
DEPRECATED: Whenever you use this model, try and figure out how to migrate
the functionality to the TravelSegment model instead.
It was too large a project to migrate to the TravelSegment model all at once,
so we're doing it piecemeal.
*/
export class Stop extends Model<InferAttributes<Stop>, InferCreationAttributes<Stop>> {
  static TravelMethods = TravelSegment.TravelMethods
  static AccommodationTypes = TravelSegment.AccommodationTypes
  static BEGINNING_OF_DAY = TravelSegment.FallbackTimes.BEGINNING_OF_DAY
  static END_OF_DAY = TravelSegment.FallbackTimes.END_OF_DAY

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare locationId: ForeignKey<Location["id"]>
  declare departureDate: Date | string | null // DATEONLY accepts Date or string, but returns string
  declare departureTime: string | null
  declare transport: string | null
  declare accommodationType: string | null
  declare isActual: CreationOptional<boolean>
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

  declare getLocation: BelongsToGetAssociationMixin<Location>
  declare setLocation: BelongsToSetAssociationMixin<Location, Location["id"]>
  declare createLocation: BelongsToCreateAssociationMixin<Location>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare location?: NonAttribute<Location>

  declare static associations: {
    travelAuthorization: Association<Stop, TravelAuthorization>
    location: Association<Stop, Location>
  }

  static establishAssociations() {
    this.belongsTo(Location, {
      as: "location",
      foreignKey: "locationId",
    })
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
    })
  }

  get departureAt(): NonAttribute<Date | null> {
    const departureDate = this.departureDate
    if (isNil(departureDate)) return null

    const timePart = this.departureTime || Stop.BEGINNING_OF_DAY
    const departureDateTime = new Date(`${departureDate}T${timePart}`)
    return departureDateTime
  }
}

Stop.init(
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
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "locations", // using real table name here
        key: "id", // using real column name here
      },
    },
    departureDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    transport: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    accommodationType: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "Stop",
    tableName: "stops",
    paranoid: false,
  }
)

export default Stop
