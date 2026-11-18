export type RawBookingEventSnapshot = {
  travelOrderEvent: Record<string, unknown>
  passengers: Record<string, unknown>[]
  airReservationSegments: Record<string, unknown>[]
  serviceFeeTransaction: Record<string, unknown> | null
}
