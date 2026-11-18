import { type IncomingMessage } from "node:http"
import { createInterface } from "node:readline"

import { type Response, type Test } from "supertest"

// Attach before starting the request so early response bytes cannot be missed.
// This reads transport lines, not CSV records (quoted CSV fields can span lines).
export function readResponseLines(download: Test, { lineCount }: { lineCount: number }) {
  return new Promise<{ status: number; lines: string[] }>((resolve, reject) => {
    download.once("error", reject)
    download.once("response", (response: Response & { res: IncomingMessage }) => {
      const reader = createInterface({ input: response.res, crlfDelay: Infinity })
      const lines: string[] = []
      response.res.once("error", reject)

      reader.on("line", (line) => {
        if (lines.length === lineCount) return

        lines.push(line)
        if (lines.length === lineCount) {
          resolve({ status: response.status, lines })
          reader.close()
        }
      })
      reader.once("close", () => {
        download.off("error", reject)
        response.res.off("error", reject)
        response.res.resume()

        if (lines.length < lineCount) {
          reject(new Error(`Response ended before ${lineCount} lines arrived`))
        }
      })
    })
  })
}

export default readResponseLines
