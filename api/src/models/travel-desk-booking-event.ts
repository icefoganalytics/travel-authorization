import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "@sequelize/core"
import { Attribute, AutoIncrement, NotNull, PrimaryKey } from "@sequelize/core/decorators-legacy"

import { TravelDeskBookingEventsExternalTravelPortIdentifierUniqueIndex } from "@/models/indexes"

import type { BookingPassenger } from "@/integrations/travel-port-integration/models/booking-passenger"
import type { BookingSegment } from "@/integrations/travel-port-integration/models/booking-segment"
import type { BookingServiceFee } from "@/integrations/travel-port-integration/models/booking-service-fee"

export class TravelDeskBookingEvent extends Model<
  InferAttributes<TravelDeskBookingEvent>,
  InferCreationAttributes<TravelDeskBookingEvent>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  /** Source: TravelPort dbo.TravelOrderEvent.TravelOrderIdentifier. */
  @Attribute(DataTypes.INTEGER)
  @NotNull
  @TravelDeskBookingEventsExternalTravelPortIdentifierUniqueIndex
  declare externalTravelPortIdentifier: number

  /** Source: TravelPort dbo.TravelOrderEvent.PnrBfVersionNbr. */
  @Attribute(DataTypes.INTEGER)
  declare bookingFileVersionNumber: number | null

  @Attribute(DataTypes.STRING(255))
  declare eventType: string | null

  @Attribute(DataTypes.STRING(255))
  declare recordLocator: string | null

  /** Source: TravelPort dbo.TravelOrderEvent.CrsDescription. */
  @Attribute(DataTypes.STRING(255))
  declare reservationSystemDescription: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  declare databaseTimestamp: Date

  @Attribute(DataTypes.DATE)
  declare hostEventTimestamp: Date | null

  /** Source: TravelPort dbo.TravelOrderEvent.PnrCreationDate. */
  @Attribute(DataTypes.DATE)
  declare passengerNameRecordCreatedAt: Date | null

  @Attribute(DataTypes.STRING(255))
  declare owningAgencyName: string | null

  @Attribute(DataTypes.STRING(255))
  declare transactionAgencyName: string | null

  @Attribute(DataTypes.STRING(255))
  declare transactionAgent: string | null

  /** Source: TravelPort dbo.TravelOrderEvent.CreatingAgencyIata. */
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
