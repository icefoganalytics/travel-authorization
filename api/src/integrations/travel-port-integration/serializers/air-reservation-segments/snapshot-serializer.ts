import { AirReservationSegment } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SnapshotSerializer extends BaseSerializer<AirReservationSegment> {
  perform() {
    return {
      TravelOrderIdentifier: this.record.travelOrderIdentifier,
      AirSegmentNbr: this.record.airSegmentNumber,
      SegmentStatus: this.record.segmentStatus,
      DepartureDate: this.record.departureDate,
      DepartureTime: this.record.departureTime,
      CarrierCode: this.record.carrierCode,
      BoardPoint: this.record.boardPoint,
      OffPoint: this.record.offPoint,
      FlightNbr: this.record.flightNumber,
      BookingCode: this.record.bookingCode,
      ArrivalTime: this.record.arrivalTime,
      ChangeOfDay: this.record.changeOfDay,
      ConnectionIndicator: this.record.connectionIndicator,
      JourneyTime: this.record.journeyTime,
      DepartureTerminal: this.record.departureTerminal,
      ArrivalTerminal: this.record.arrivalTerminal,
      RecordLocator: this.record.recordLocator,
      EquipmentType: this.record.equipmentType,
      Mileage: this.record.mileage,
      ClassOfServDesc: this.record.classOfServiceDescription,
      ChangeOfGaugeIndicator: this.record.changeOfGaugeIndicator,
    }
  }
}

export default SnapshotSerializer
