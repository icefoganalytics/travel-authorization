import { QueryTypes } from "@sequelize/core"

import logger from "@/utils/logger"
import sourceDatabase from "@/integrations/travel-port-integration/db/db-client"
import BaseService from "@/services/base-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export type BookingReference = { recordLocator: string }

type BookingPage = {
  travelPortBookings: BookingReference[]
  totalCount: number
}

// Canonicalize before filtering, counting, ordering, and paging: source rows are events,
// and multiple events (including differently cased locators) represent one booking.
const BOOKING_REFERENCES_SQL = `
  SELECT DISTINCT UPPER(LTRIM(RTRIM([RecordLocator]))) AS [recordLocator]
  FROM [dbo].[TravelOrderEvent]
  WHERE LEN(LTRIM(RTRIM([RecordLocator]))) = 6
    AND UPPER(LTRIM(RTRIM([RecordLocator]))) COLLATE Latin1_General_100_BIN2
      NOT LIKE '%[^A-Z0-9]%'
`

export class BookingsService extends BaseService {
  constructor(
    protected search: unknown,
    protected limit: number,
    protected offset: number
  ) {
    super()
  }

  async perform(): Promise<BookingPage> {
    const prefix = this.normalizeSearch()
    const replacements = {
      prefix: prefix + "%",
      limit: this.limit,
      offset: Math.max(0, this.offset),
    }
    try {
      const counts = await sourceDatabase.query<{ totalCount: number }>(
        `SELECT COUNT(*) AS [totalCount] FROM (` +
          BOOKING_REFERENCES_SQL +
          `) AS [bookingReferences]
         WHERE [recordLocator] LIKE :prefix`,
        { type: QueryTypes.SELECT, replacements }
      )
      const travelPortBookings = await sourceDatabase.query<BookingReference>(
        `SELECT [recordLocator] FROM (` +
          BOOKING_REFERENCES_SQL +
          `) AS [bookingReferences]
         WHERE [recordLocator] LIKE :prefix
         ORDER BY [recordLocator] ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        { type: QueryTypes.SELECT, replacements }
      )
      return { travelPortBookings, totalCount: Number(counts[0]?.totalCount ?? 0) }
    } catch (error) {
      logger.error("Travelport booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }

  private normalizeSearch(): string {
    if (this.search === undefined) return ""

    if (typeof this.search !== "string") {
      throw new InvoiceValidationError("Booking search must be a locator prefix.")
    }

    const prefix = this.search.trim().toUpperCase()
    if (!/^[A-Z0-9]{0,6}$/.test(prefix)) {
      throw new InvoiceValidationError(
        "Booking search must contain at most six letters or numbers."
      )
    }

    return prefix
  }
}

export default BookingsService
