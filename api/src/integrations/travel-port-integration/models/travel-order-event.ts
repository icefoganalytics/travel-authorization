import {
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import { Attribute, HasMany, HasOne, Table } from "@sequelize/core/decorators-legacy"

import { UtcSqlServerDateTime } from "@/integrations/travel-port-integration/db/utc-sql-server-date-time"

import BaseModel from "@/models/base-model"
import AirReservationSegment from "@/integrations/travel-port-integration/models/air-reservation-segment"
import Passenger from "@/integrations/travel-port-integration/models/passenger"
import ServiceFeeTransaction from "@/integrations/travel-port-integration/models/service-fee-transaction"

@Table({
  tableName: "TravelOrderEvent",
  schema: "dbo",
  underscored: false,
  timestamps: false,
  paranoid: false,
})
export class TravelOrderEvent extends BaseModel<
  InferAttributes<TravelOrderEvent>,
  InferCreationAttributes<TravelOrderEvent>
> {
  @Attribute({
    type: DataTypes.INTEGER,
    columnName: "TravelOrderIdentifier",
    allowNull: false,
    primaryKey: true,
  })
  declare travelOrderIdentifier: number

  @Attribute({ type: DataTypes.INTEGER, columnName: "PnrBfVersionNbr", allowNull: true })
  declare bookingFileVersionNumber: number | null

  @Attribute({ type: DataTypes.CHAR(1), columnName: "EventType", allowNull: true })
  declare eventType: string | null

  @Attribute({ type: DataTypes.CHAR(6), columnName: "RecordLocator", allowNull: true })
  declare recordLocator: string | null

  @Attribute({ type: UtcSqlServerDateTime, columnName: "HostEventTimeStamp", allowNull: true })
  declare hostEventTimestamp: Date | null

  @Attribute({ type: DataTypes.CHAR(9), columnName: "CrsDescription", allowNull: true })
  declare crsDescription: string | null

  @Attribute({ type: UtcSqlServerDateTime, columnName: "DatabaseTimeStamp", allowNull: false })
  declare databaseTimestamp: Date

  @Attribute({ type: DataTypes.CHAR(4), columnName: "TransactionPseudo", allowNull: true })
  declare transactionPseudo: string | null

  @Attribute({ type: DataTypes.CHAR(8), columnName: "TransactionAgent", allowNull: true })
  declare transactionAgent: string | null

  @Attribute({ type: DataTypes.CHAR(4), columnName: "OwningAgencyPseudo", allowNull: true })
  declare owningAgencyPseudo: string | null

  @Attribute({ type: DataTypes.CHAR(5), columnName: "OriginalBookingLocation", allowNull: true })
  declare originalBookingLocation: string | null

  @Attribute({ type: DataTypes.DECIMAL(18, 0), columnName: "CreatingAgencyIata", allowNull: true })
  declare creatingAgencyIata: string | null

  @Attribute({ type: UtcSqlServerDateTime, columnName: "PnrCreationDate", allowNull: true })
  declare pnrCreationDate: Date | null

  @Attribute({ type: UtcSqlServerDateTime, columnName: "PnrPurgeDate", allowNull: true })
  declare pnrPurgeDate: Date | null

  @Attribute({ type: DataTypes.STRING(24), columnName: "OwningAgencyName", allowNull: true })
  declare owningAgencyName: string | null

  @Attribute({ type: DataTypes.STRING(24), columnName: "TransactionAgencyName", allowNull: true })
  declare transactionAgencyName: string | null

  @Attribute({ type: DataTypes.CHAR(7), columnName: "LastActionAgentID", allowNull: true })
  declare lastActionAgentId: string | null

  @HasMany(() => Passenger, {
    foreignKey: "travelOrderIdentifier",
    sourceKey: "travelOrderIdentifier",
    inverse: { as: "travelOrderEvent" },
  })
  declare passengers?: NonAttribute<Passenger[]>

  @HasMany(() => AirReservationSegment, {
    foreignKey: "travelOrderIdentifier",
    sourceKey: "travelOrderIdentifier",
    inverse: { as: "travelOrderEvent" },
  })
  declare airReservationSegments?: NonAttribute<AirReservationSegment[]>

  @HasOne(() => ServiceFeeTransaction, {
    foreignKey: "travelOrderIdentifier",
    sourceKey: "travelOrderIdentifier",
    inverse: { as: "travelOrderEvent" },
  })
  declare serviceFeeTransaction?: NonAttribute<ServiceFeeTransaction | null>
}

export default TravelOrderEvent
