import { EventEmitter, once } from "node:events"
import { PassThrough } from "node:stream"
import { buffer } from "node:stream/consumers"
import { setImmediate } from "node:timers/promises"

import streamCsv from "@/utils/stream-csv"

describe("api/src/utils/stream-csv.ts", () => {
  describe("streamCsv", () => {
    test("when a consumer pauses, it waits before generating further rows and preserves the complete CSV", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      let isNextRowGenerated = false
      const transfer = streamCsv(destination, ["Name", "Amount"], async (writeRow) => {
        generation.emit("rowStarted")
        for (let index = 0; index < 32; index++) {
          await writeRow({ Name: largeValue, Amount: 0 })
        }
        isNextRowGenerated = true
        await writeRow({ Name: '=SUM(1,2)\n"quoted"', Amount: -2 })
      })

      try {
        // Act
        await rowStarted
        await setImmediate()

        // Assert
        expect(isNextRowGenerated).toEqual(false)
        const content = buffer(destination)
        await transfer
        const repeatedRows = `${largeValue},0\r\n`.repeat(32)
        expect(await content).toEqual(
          Buffer.from(`\uFEFFName,Amount\r\n${repeatedRows}"'=SUM(1,2)\n""quoted""",-2\r\n`)
        )
      } finally {
        destination.destroy()
        await Promise.allSettled([transfer])
      }
    })

    test("when the consumer disconnects under backpressure, it stops generation and rejects the transfer", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const disconnected = new Error("Client disconnected")
      const nextRow = vi.fn()
      const transfer = streamCsv(destination, ["Name"], async (writeRow) => {
        generation.emit("rowStarted")
        for (let index = 0; index < 32; index++) {
          await writeRow({ Name: largeValue })
        }
        nextRow()
      })
      const result = transfer.catch((error: unknown) => error)

      // Act
      await rowStarted
      await setImmediate()
      destination.destroy(disconnected)

      // Assert
      expect(await result).toEqual(disconnected)
      expect(nextRow).not.toHaveBeenCalled()
    })
  })
})
