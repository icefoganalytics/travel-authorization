import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

// RecordLocator is the six-character booking reference shared by related source
// events, not the numeric TravelOrderIdentifier identifying an individual event.
export function normalizeRecordLocator(rawRecordLocator: string): string {
  const recordLocator = rawRecordLocator.trim().toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
    throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
  }

  return recordLocator
}
