import { once } from "node:events"
import { type Writable } from "node:stream"
import { pipeline } from "node:stream/promises"

import { format } from "fast-csv"

import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"

type CsvRow = Record<string, string | number>
type WriteRow = (row: CsvRow) => Promise<void>

const MAX_EXPORT_DURATION_MS = 2 * 60 * 1000

export class CsvStreamingClient {
  async stream(
    outputStream: Writable,
    headers: string[],
    generateRows: (writeRow: WriteRow) => Promise<void>
  ): Promise<void> {
    const formatter = format<string[] | CsvRow, string[] | CsvRow>({
      headers: true,
      includeEndRowDelimiter: true,
      rowDelimiter: "\r\n",
      writeBOM: true,
    })
    const cancellation = new AbortController()
    const deadline = setTimeout(() => cancellation.abort(), MAX_EXPORT_DURATION_MS)
    const transfer = pipeline(formatter, outputStream, { signal: cancellation.signal }).catch((error: unknown) => {
      cancellation.abort(error)
      throw error
    })
    const generation = generate()

    try {
      await Promise.all([transfer, generation])
    } catch (error) {
      formatter.destroy()
      // Wait for the producer to release its transaction after a disconnected client.
      await Promise.allSettled([transfer, generation])
      throw error
    } finally {
      clearTimeout(deadline)
    }

    async function generate(): Promise<void> {
      // An explicit header row also emits the BOM for an empty report in fast-csv 5.
      await write(headers)
      await generateRows(async (row) => {
        for (const header of headers) {
          const value = row[header]
          if (typeof value === "string") {
            row[header] = neutralizeSpreadsheetFormula(value)
          }
        }
        await write(row)
      })
      formatter.end()
    }

    async function write(row: string[] | CsvRow): Promise<void> {
      cancellation.signal.throwIfAborted()
      if (!formatter.write(row)) {
        await once(formatter, "drain", { signal: cancellation.signal })
      }
    }
  }
}

const csvStreamingClient = new CsvStreamingClient()

export default csvStreamingClient
