export type SegmentAsReference = {
  id: number
  invoiceId: number
  invoiceDetailId: number
  legNumber: number
  departureCityCode: string | null
  departureInfo: string | null
  arrivalCityCode: string | null
  arrivalInfo: string | null
  airlineCode: string | null
  flightNumber: string | null
  classOfService: string | null
  fareBasis: string | null
  departureCityName: string | null
  arrivalCityName: string | null
}
