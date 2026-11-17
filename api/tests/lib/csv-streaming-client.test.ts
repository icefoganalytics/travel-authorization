import { EventEmitter, once } from "node:events"
import { PassThrough } from "node:stream"
import { buffer } from "node:stream/consumers"
import { setImmediate } from "node:timers/promises"

import csvStreamingClient from "@/lib/csv-streaming-client"

describe("api/src/lib/csv-streaming-client.ts", () => {
  describe("CsvStreamingClient#stream", () => {
    test("when a consumer pauses, it waits before generating further rows", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      let isNextRowGenerated = false
      const transfer = csvStreamingClient.stream(destination, ["Name", "Amount"], async (writeRow) => {
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
        destination.resume()
        await transfer
      } finally {
        destination.destroy()
        await Promise.allSettled([transfer])
      }
    })

    test("when a paused consumer resumes, it receives the complete CSV with escaped text and numeric values", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const repeatedRows = `${largeValue},0\r\n`.repeat(32)
      const expectedCsv = Buffer.from(
        `\uFEFFName,Amount\r\n${repeatedRows}"'=SUM(1,2)\n""quoted""",-2\r\n`
      )
      const transfer = csvStreamingClient.stream(destination, ["Name", "Amount"], async (writeRow) => {
        generation.emit("rowStarted")
        for (let index = 0; index < 32; index++) {
          await writeRow({ Name: largeValue, Amount: 0 })
        }
        await writeRow({ Name: '=SUM(1,2)\n"quoted"', Amount: -2 })
      })

      try {
        // Act
        await rowStarted
        await setImmediate()
        const content = buffer(destination)
        await transfer
        const csv = await content

        // Assert
        expect(csv).toEqual(expectedCsv)
      } finally {
        destination.destroy()
        await Promise.allSettled([transfer])
      }
    })

    test("when the consumer disconnects under backpressure, it rejects the transfer", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const disconnected = new Error("Client disconnected")
      const transfer = csvStreamingClient.stream(destination, ["Name"], async (writeRow) => {
        generation.emit("rowStarted")
        for (let index = 0; index < 32; index++) {
          await writeRow({ Name: largeValue })
        }
      })
      const result = transfer.catch((error: unknown) => error)

      // Act
      await rowStarted
      await setImmediate()
      destination.destroy(disconnected)

      // Assert
      expect(await result).toEqual(disconnected)
    })

    test("when the consumer disconnects under backpressure, it stops generating further rows", async () => {
      // Arrange
      const destination = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const disconnected = new Error("Client disconnected")
      const nextRow = vi.fn()
      const transfer = csvStreamingClient.stream(destination, ["Name"], async (writeRow) => {
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
      await result

      // Assert
      expect(nextRow).not.toHaveBeenCalled()
    })
  })
})
