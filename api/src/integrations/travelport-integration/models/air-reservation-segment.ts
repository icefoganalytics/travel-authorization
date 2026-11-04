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
  tableName: "AirRsrvSeg",
  schema: "dbo",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class AirReservationSegment extends Model<
  InferAttributes<AirReservationSegment>,
  InferCreationAttributes<AirReservationSegment>
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
    columnName: "AirSegmentNbr",
    allowNull: false,
    primaryKey: true,
  })
  declare airSegmentNumber: number

  @Attribute({ type: DataTypes.CHAR(2), columnName: "SegmentStatus", allowNull: true })
  declare segmentStatus: string | null

  @Attribute({ type: DataTypes.CHAR(10), columnName: "DepartureDate", allowNull: true })
  declare departureDate: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "DepartureTime", allowNull: true })
  declare departureTime: string | null

  @Attribute({ type: DataTypes.CHAR(3), columnName: "CarrierCode", allowNull: true })
  declare carrierCode: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "BoardPoint", allowNull: true })
  declare boardPoint: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "OffPoint", allowNull: true })
  declare offPoint: string | null

  @Attribute({ type: DataTypes.CHAR(4), columnName: "FlightNbr", allowNull: true })
  declare flightNumber: string | null

  @Attribute({ type: DataTypes.CHAR(2), columnName: "BookingCode", allowNull: true })
  declare bookingCode: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "ArrivalTime", allowNull: true })
  declare arrivalTime: string | null

  @Attribute({ type: DataTypes.INTEGER, columnName: "ChangeOfDay", allowNull: true })
  declare changeOfDay: number | null

  @Attribute({ type: DataTypes.CHAR(1), columnName: "ConnectionIndicator", allowNull: true })
  declare connectionIndicator: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "JourneyTime", allowNull: true })
  declare journeyTime: string | null

  @Attribute({ type: DataTypes.CHAR(2), columnName: "DepartureTerminal", allowNull: true })
  declare departureTerminal: string | null

  @Attribute({ type: DataTypes.CHAR(2), columnName: "ArrivalTerminal", allowNull: true })
  declare arrivalTerminal: string | null

  @Attribute({ type: DataTypes.CHAR(6), columnName: "RecordLocator", allowNull: true })
  declare recordLocator: string | null

  @Attribute({ type: DataTypes.CHAR(3), columnName: "EquipmentType", allowNull: true })
  declare equipmentType: string | null

  @Attribute({ type: DataTypes.STRING(5), columnName: "Mileage", allowNull: true })
  declare mileage: string | null

  @Attribute({ type: DataTypes.STRING(32), columnName: "ClassOfServDesc", allowNull: true })
  declare classOfServiceDescription: string | null

  @Attribute({ type: DataTypes.CHAR(1), columnName: "ChangeOfGaugeIndicator", allowNull: true })
  declare changeOfGaugeIndicator: string | null

  @BelongsTo(() => TravelOrderEvent, {
    foreignKey: "travelOrderIdentifier",
    targetKey: "travelOrderIdentifier",
    inverse: { as: "airReservationSegments", type: "hasMany" },
  })
  declare travelOrderEvent?: NonAttribute<TravelOrderEvent>
}

export default AirReservationSegment
