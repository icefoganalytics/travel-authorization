import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

export function normalizeRecordLocator(value: string): string {
  const recordLocator = value.trim().toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
    throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
  }

  return recordLocator
}
