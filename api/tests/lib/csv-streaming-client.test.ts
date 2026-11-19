import { EventEmitter, once } from "node:events"
import { PassThrough } from "node:stream"
import { buffer } from "node:stream/consumers"
import { setImmediate } from "node:timers/promises"

import csvStreamingClient from "@/lib/csv-streaming-client"
import db from "@/models"

describe("api/src/lib/csv-streaming-client.ts", () => {
  describe("CsvStreamingClient#stream", () => {
    describe("download deadline", () => {
      const deadlineInMilliseconds = 2 * 60 * 1000

      beforeEach(() => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      test("when a download exceeds its deadline, it rolls back the producer transaction", async () => {
        // Arrange
        const outputStream = new PassThrough({ highWaterMark: 1 })
        const generation = new EventEmitter()
        const transactionStarted = once(generation, "transactionStarted")
        let isTransactionRolledBack = false
        const transfer = csvStreamingClient.stream(outputStream, ["Name"], (writeRow) =>
          db.transaction(async (transaction) => {
            transaction.afterRollback(() => {
              isTransactionRolledBack = true
            })
            generation.emit("transactionStarted")
            const row = { Name: "x".repeat(64 * 1024) }
            for (let index = 0; index < 64; index++) {
              await writeRow(row)
            }
          })
        )
        const completion = Promise.allSettled([transfer])

        try {
          // Act
          await transactionStarted
          await vi.advanceTimersByTimeAsync(deadlineInMilliseconds)
          await completion

          // Assert
          expect(isTransactionRolledBack).toBe(true)
        } finally {
          outputStream.destroy()
          await completion
        }
      })

      test("when a download exceeds its deadline, it closes the output stream", async () => {
        // Arrange
        const outputStream = new PassThrough({ highWaterMark: 1 })
        const transfer = csvStreamingClient.stream(outputStream, ["Name"], (writeRow) =>
          writeRow({ Name: "Sample" })
        )
        const completion = Promise.allSettled([transfer])

        try {
          // Act
          await vi.advanceTimersByTimeAsync(deadlineInMilliseconds)

          // Assert
          expect(outputStream.closed).toBe(true)
        } finally {
          outputStream.destroy()
          await completion
        }
      })

      test("when a download exceeds its deadline, it rejects the transfer with an AbortError", async () => {
        // Arrange
        const outputStream = new PassThrough({ highWaterMark: 1 })
        const transfer = csvStreamingClient.stream(outputStream, ["Name"], (writeRow) =>
          writeRow({ Name: "Sample" })
        )
        const completion = Promise.allSettled([transfer])

        try {
          // Act
          await vi.advanceTimersByTimeAsync(deadlineInMilliseconds)

          // Assert
          await expect(transfer).rejects.toHaveProperty("name", "AbortError")
        } finally {
          outputStream.destroy()
          await completion
        }
      })
    })

    test("when a consumer pauses, it waits before generating further rows", async () => {
      // Arrange
      const outputStream = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      let isNextRowGenerated = false
      const transfer = csvStreamingClient.stream(outputStream, ["Name", "Amount"], async (writeRow) => {
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
        outputStream.resume()
        await transfer
      } finally {
        outputStream.destroy()
        await Promise.allSettled([transfer])
      }
    })

    test("when a paused consumer resumes, it receives the complete CSV with escaped text and numeric values", async () => {
      // Arrange
      const outputStream = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const repeatedRows = `${largeValue},0\r\n`.repeat(32)
      const expectedCsv = Buffer.from(
        `\uFEFFName,Amount\r\n${repeatedRows}"'=SUM(1,2)\n""quoted""",-2\r\n`
      )
      const transfer = csvStreamingClient.stream(outputStream, ["Name", "Amount"], async (writeRow) => {
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
        const content = buffer(outputStream)
        await transfer
        const csv = await content

        // Assert
        expect(csv).toEqual(expectedCsv)
      } finally {
        outputStream.destroy()
        await Promise.allSettled([transfer])
      }
    })

    test("when the consumer disconnects under backpressure, it rejects the transfer", async () => {
      // Arrange
      const outputStream = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const disconnected = new Error("Client disconnected")
      const transfer = csvStreamingClient.stream(outputStream, ["Name"], async (writeRow) => {
        generation.emit("rowStarted")
        for (let index = 0; index < 32; index++) {
          await writeRow({ Name: largeValue })
        }
      })

      // Act
      await rowStarted
      await setImmediate()
      const rejection = expect(transfer).rejects.toThrow("Client disconnected")
      outputStream.destroy(disconnected)

      // Assert
      await rejection
    })

    test("when the consumer disconnects under backpressure, it stops generating further rows", async () => {
      // Arrange
      const outputStream = new PassThrough({ highWaterMark: 1 })
      const generation = new EventEmitter()
      const rowStarted = once(generation, "rowStarted")
      const largeValue = "x".repeat(256 * 1024)
      const disconnected = new Error("Client disconnected")
      const nextRow = vi.fn()
      const transfer = csvStreamingClient.stream(outputStream, ["Name"], async (writeRow) => {
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
      outputStream.destroy(disconnected)
      await result

      // Assert
      expect(nextRow).not.toHaveBeenCalled()
    })
  })
})
