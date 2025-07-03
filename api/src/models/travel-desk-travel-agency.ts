import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  HasOne,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

@Table({
  timestamps: false,
  paranoid: false,
})
export class TravelDeskTravelAgency extends Model<
  InferAttributes<TravelDeskTravelAgency>,
  InferCreationAttributes<TravelDeskTravelAgency>
> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare agencyName: string

  @Attribute(DataTypes.STRING)
  declare contactName: string | null

  @Attribute(DataTypes.STRING)
  declare contactEmail: string | null

  @Attribute(DataTypes.STRING(20))
  declare contactPhoneNumber: string | null

  @Attribute(DataTypes.TEXT)
  declare agencyInfo: string | null

  // Associations
  @HasOne(() => TravelDeskTravelRequest, {
    foreignKey: "travelAgencyId",
    inverse: "travelAgency",
  })
  declare travelRequest?: NonAttribute<TravelDeskTravelRequest>

  static establishScopes(): void {
    // add as needed
  }
}

export default TravelDeskTravelAgency
