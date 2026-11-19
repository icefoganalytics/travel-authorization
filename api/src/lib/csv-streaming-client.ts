import { once } from "node:events"
import { type Writable } from "node:stream"
import { pipeline } from "node:stream/promises"

import { format } from "fast-csv"

import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"

type CsvRow = Record<string, string | number>
type WriteRow = (row: CsvRow) => Promise<void>
type GenerateRows = (writeRow: WriteRow, signal: AbortSignal) => Promise<void>

const MAX_EXPORT_DURATION_MS = 2 * 60 * 1000

export class CsvStreamingClient {
  static async stream(outputStream: Writable, headers: string[], generateRows: GenerateRows): Promise<void> {
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
    const generation = this.writeReport(formatter, headers, generateRows, cancellation.signal)

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
  }

  private static async writeReport(
    formatter: Writable,
    headers: string[],
    generateRows: GenerateRows,
    signal: AbortSignal
  ): Promise<void> {
    // Writing the header explicitly emits the BOM even for an empty report.
    await this.writeRow(formatter, headers, signal)
    await generateRows((row) => {
      for (const header of headers) {
        const value = row[header]
        if (typeof value === "string") {
          row[header] = neutralizeSpreadsheetFormula(value)
        }
      }
      return this.writeRow(formatter, row, signal)
    }, signal)
    formatter.end()
  }

  private static async writeRow(
    formatter: Writable,
    row: string[] | CsvRow,
    signal: AbortSignal
  ): Promise<void> {
    if (!formatter.write(row)) {
      await once(formatter, "drain", { signal })
    }
  }
}

export default CsvStreamingClient
