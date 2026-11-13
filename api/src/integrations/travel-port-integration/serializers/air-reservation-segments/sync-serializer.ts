import { pick } from "lodash"

import { AirReservationSegment } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<AirReservationSegment> {
  perform() {
    const segmentStatus = this.trimSourceValue(this.record.segmentStatus)
    const carrierCode = this.trimSourceValue(this.record.carrierCode)
    const boardPoint = this.trimSourceValue(this.record.boardPoint)
    const offPoint = this.trimSourceValue(this.record.offPoint)
    const flightNumber = this.trimSourceValue(this.record.flightNumber)
    const departureDate = this.trimSourceValue(this.record.departureDate)
    const departureTime = this.trimSourceValue(this.record.departureTime)
    const arrivalTime = this.trimSourceValue(this.record.arrivalTime)

    return {
      ...pick(this.record, ["airSegmentNumber", "changeOfDay"]),
      segmentStatus,
      carrierCode,
      boardPoint,
      offPoint,
      flightNumber,
      departureDate,
      departureTime,
      arrivalTime,
    }
  }

  private trimSourceValue(value: string | null): string | null {
    return value?.trim() ?? null
  }
}

export default SyncSerializer
