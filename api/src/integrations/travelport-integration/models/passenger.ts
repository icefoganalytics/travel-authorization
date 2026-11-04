import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy"

import TravelOrderEvent from "@/integrations/travelport-integration/models/travel-order-event"

@Table({
  tableName: "Passenger",
  schema: "dbo",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class Passenger extends Model<
  InferAttributes<Passenger>,
  InferCreationAttributes<Passenger>
> {
  @Attribute({
    type: DataTypes.INTEGER,
    columnName: "TravelOrderIdentifier",
    allowNull: false,
    primaryKey: true,
  })
  declare travelOrderIdentifier: number

  @Attribute({
    type: DataTypes.INTEGER,
    columnName: "LastNameElement",
    allowNull: false,
    primaryKey: true,
  })
  declare lastNameElement: number

  @Attribute({
    type: DataTypes.INTEGER,
    columnName: "PassengerElement",
    allowNull: false,
    primaryKey: true,
  })
  declare passengerElement: number

  @Attribute({ type: DataTypes.INTEGER, columnName: "AbsoluteNameElement", allowNull: true })
  declare absoluteNameElement: number | null

  @Attribute({ type: DataTypes.STRING(55), columnName: "FirstName", allowNull: true })
  declare firstName: string | null

  @Attribute({ type: DataTypes.STRING(55), columnName: "LastName", allowNull: true })
  declare lastName: string | null

  @Attribute({ type: DataTypes.STRING(55), columnName: "NameRemark", allowNull: true })
  declare nameRemark: string | null

  @BelongsTo(() => TravelOrderEvent, {
    foreignKey: "travelOrderIdentifier",
    targetKey: "travelOrderIdentifier",
    inverse: { as: "passengers", type: "hasMany" },
  })
  declare travelOrderEvent?: NonAttribute<TravelOrderEvent>
}

export default Passenger
