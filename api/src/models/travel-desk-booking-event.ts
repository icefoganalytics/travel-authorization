import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  Index,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import type {
  BookingPassenger,
  BookingSegment,
  BookingServiceFee,
} from "@/integrations/travelport-integration/models/booking-event-snapshot"

export class TravelDeskBookingEvent extends Model<
  InferAttributes<TravelDeskBookingEvent>,
  InferCreationAttributes<TravelDeskBookingEvent>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Index({ unique: true })
  declare externalTravelportIdentifier: number

  @Attribute(DataTypes.INTEGER)
  declare bookingFileVersionNumber: number | null

  @Attribute(DataTypes.STRING(255))
  declare eventType: string | null

  @Attribute(DataTypes.STRING(255))
  @Index({})
  declare recordLocator: string | null

  @Attribute(DataTypes.STRING(255))
  declare reservationSystemDescription: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  declare databaseTimestamp: Date

  @Attribute(DataTypes.DATE)
  declare hostEventTimestamp: Date | null

  @Attribute(DataTypes.DATE)
  declare passengerNameRecordCreatedAt: Date | null

  @Attribute(DataTypes.STRING(255))
  declare owningAgencyName: string | null

  @Attribute(DataTypes.STRING(255))
  declare transactionAgencyName: string | null

  @Attribute(DataTypes.STRING(255))
  declare transactionAgent: string | null

  @Attribute(DataTypes.STRING(255))
  declare creatingAgencyInternationalAirTransportAssociationNumber: string | null

  @Attribute(DataTypes.JSONB)
  @NotNull
  declare passengers: BookingPassenger[]

  @Attribute(DataTypes.JSONB)
  @NotNull
  declare airReservationSegments: BookingSegment[]

  @Attribute(DataTypes.JSONB)
  declare serviceFeeTransaction: BookingServiceFee | null

  @Attribute(DataTypes.DATE)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null
}

export default TravelDeskBookingEvent
