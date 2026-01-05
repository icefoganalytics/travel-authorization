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
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy"

import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"

// TODO: Consider if this model is needed, maybe we should be setting the invoiceNumber on the TravelDeskTravelRequest model.
// And then this model could be replaced by a generic Attachment object.
@Table({
  tableName: "travel_desk_passenger_name_record_documents",
  paranoid: false,
})
export class TravelDeskPassengerNameRecordDocument extends Model<
  InferAttributes<TravelDeskPassengerNameRecordDocument>,
  InferCreationAttributes<TravelDeskPassengerNameRecordDocument>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare travelDeskTravelRequestId: number

  @Attribute(DataTypes.BLOB)
  declare pnrDocument: Buffer | null

  @Attribute(DataTypes.STRING(255))
  declare invoiceNumber: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // TODO: simplify this to travelRequest and update foreign key to match othe models.
  @BelongsTo(() => TravelDeskTravelRequest, {
    foreignKey: {
      name: "travelDeskTravelRequestId",
      onDelete: "CASCADE",
    },
    inverse: {
      as: "passengerNameRecordDocument",
      type: "hasOne",
    },
  })
  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>

  static establishScopes(): void {
    // add as needed
  }
}

export default TravelDeskPassengerNameRecordDocument
