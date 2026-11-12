import { pick } from "lodash"

import { AirReservationSegment } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<AirReservationSegment> {
  perform() {
    return {
      ...pick(this.record, ["airSegmentNumber", "changeOfDay"]),
      segmentStatus: this.record.segmentStatus?.trim() ?? null,
      carrierCode: this.record.carrierCode?.trim() ?? null,
      boardPoint: this.record.boardPoint?.trim() ?? null,
      offPoint: this.record.offPoint?.trim() ?? null,
      flightNumber: this.record.flightNumber?.trim() ?? null,
      departureDate: this.record.departureDate?.trim() ?? null,
      departureTime: this.record.departureTime?.trim() ?? null,
      arrivalTime: this.record.arrivalTime?.trim() ?? null,
    }
  }
}

export default SyncSerializer
