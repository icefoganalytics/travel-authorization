export type BookingSegment = {
  airSegmentNumber: number
  segmentStatus: string | null
  carrierCode: string | null
  boardPoint: string | null
  offPoint: string | null
  flightNumber: string | null
  departureDate: string | null
  departureTime: string | null
  arrivalTime: string | null
  changeOfDay: number | null
}
