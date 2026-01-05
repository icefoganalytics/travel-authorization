/** Keep in sync with api/src/models/travel-desk-passenger-name-record-document.ts */

export type TravelDeskPassengerNameRecordDocumentAsReference = {
  id: number
  travelDeskTravelRequestId: number
  invoiceNumber: string | null
  createdAt: string
  updatedAt: string
}
