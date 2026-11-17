import { EventEmitter, once } from "node:events"
import { type Server } from "node:http"
import { type AddressInfo } from "node:net"
import { createInterface } from "node:readline"
import { Readable } from "node:stream"
import { type ReadableStream } from "node:stream/web"

import { User } from "@/models"
import { CreateCsvService as ReconciliationCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import { CreateCsvService as StatisticsCsvService } from "@/services/downloads/flight-statistics/create-csv-service"
import { CreateCsvService as PreApprovalCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"
import streamCsv from "@/utils/stream-csv"

import { userFactory } from "@/factories"
import { mockCurrentUser } from "@/support"

import app from "@/app"

// These scenarios need a live socket to observe a response before generation completes.
describe("CSV download startup over HTTP", () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    server = app.listen(0, "127.0.0.1")
    await once(server, "listening")
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  })

  describe("FlightReconciliationsController", () => {
    describe("create", () => {
      test("when later rows are pending, it delivers an earlier row before generation finishes", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(ReconciliationCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof ReconciliationCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Next traveller" })
              await completion
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        try {
          // Act
          const response = await fetch(`${baseUrl}/api/downloads/flight-reconciliations?format=csv`, {
            method: "POST",
            signal: AbortSignal.timeout(5000),
          })
          if (response.body === null) {
            throw new Error("Expected a CSV response body")
          }

          const body = response.body as ReadableStream<Uint8Array>
          const input = Readable.fromWeb(body)
          const lines = createInterface({ input })
          const reader = lines[Symbol.asyncIterator]()
          await reader.next() // Column header.
          const firstRow = await reader.next()

          // Assert
          expect(response.status).toEqual(200)
          expect(firstRow.value).toEqual("Traveller")
        } finally {
          generation.emit("complete")
        }
      })

      test("when generation completes, it delivers the complete CSV", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        vi.spyOn(ReconciliationCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof ReconciliationCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        // Act
        const response = await fetch(`${baseUrl}/api/downloads/flight-reconciliations?format=csv`, {
          method: "POST",
          signal: AbortSignal.timeout(5000),
        })
        const content = await response.arrayBuffer()
        const csv = Buffer.from(content)

        // Assert
        expect(response.status).toEqual(200)
        expect(csv).toEqual(Buffer.from("\uFEFFName\r\nTraveller\r\nLast traveller\r\n"))
      })

      test("when generation fails after headers arrive, it rejects the partial download", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(ReconciliationCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof ReconciliationCsvService>
            destination.write("\uFEFFName\r\n")
            await completion
          }
        )

        try {
          // Act
          const response = await fetch(`${baseUrl}/api/downloads/flight-reconciliations?format=csv`, {
            method: "POST",
            signal: AbortSignal.timeout(5000),
          })
          generation.emit("error", new Error("CSV generation failed"))

          // Assert
          await expect(response.arrayBuffer()).rejects.toThrow("terminated")
        } finally {
          generation.emit("complete")
        }
      })
    })
  })

  describe("FlightStatisticsController", () => {
    describe("create", () => {
      test("when later rows are pending, it delivers an earlier row before generation finishes", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(StatisticsCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof StatisticsCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Next traveller" })
              await completion
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        try {
          // Act
          const response = await fetch(`${baseUrl}/api/downloads/flight-statistics?format=csv`, {
            method: "POST",
            signal: AbortSignal.timeout(5000),
          })
          if (response.body === null) {
            throw new Error("Expected a CSV response body")
          }

          const body = response.body as ReadableStream<Uint8Array>
          const input = Readable.fromWeb(body)
          const lines = createInterface({ input })
          const reader = lines[Symbol.asyncIterator]()
          await reader.next() // Column header.
          const firstRow = await reader.next()

          // Assert
          expect(response.status).toEqual(200)
          expect(firstRow.value).toEqual("Traveller")
        } finally {
          generation.emit("complete")
        }
      })

      test("when generation completes, it delivers the complete CSV", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        vi.spyOn(StatisticsCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof StatisticsCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        // Act
        const response = await fetch(`${baseUrl}/api/downloads/flight-statistics?format=csv`, {
          method: "POST",
          signal: AbortSignal.timeout(5000),
        })
        const content = await response.arrayBuffer()
        const csv = Buffer.from(content)

        // Assert
        expect(response.status).toEqual(200)
        expect(csv).toEqual(Buffer.from("\uFEFFName\r\nTraveller\r\nLast traveller\r\n"))
      })

      test("when generation fails after headers arrive, it rejects the partial download", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(StatisticsCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , destination] = args as ConstructorParameters<typeof StatisticsCsvService>
            destination.write("\uFEFFName\r\n")
            await completion
          }
        )

        try {
          // Act
          const response = await fetch(`${baseUrl}/api/downloads/flight-statistics?format=csv`, {
            method: "POST",
            signal: AbortSignal.timeout(5000),
          })
          generation.emit("error", new Error("CSV generation failed"))

          // Assert
          await expect(response.arrayBuffer()).rejects.toThrow("terminated")
        } finally {
          generation.emit("complete")
        }
      })
    })
  })

  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("create", () => {
      test("when later rows are pending, it delivers an earlier row before generation finishes", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(PreApprovalCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , , destination] = args as ConstructorParameters<typeof PreApprovalCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Next traveller" })
              await completion
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        try {
          // Act
          const response = await fetch(
            `${baseUrl}/api/downloads/travel-authorization-pre-approvals?format=csv`,
            {
              method: "POST",
              signal: AbortSignal.timeout(5000),
            }
          )
          if (response.body === null) {
            throw new Error("Expected a CSV response body")
          }

          const body = response.body as ReadableStream<Uint8Array>
          const input = Readable.fromWeb(body)
          const lines = createInterface({ input })
          const reader = lines[Symbol.asyncIterator]()
          await reader.next() // Column header.
          const firstRow = await reader.next()

          // Assert
          expect(response.status).toEqual(200)
          expect(firstRow.value).toEqual("Traveller")
        } finally {
          generation.emit("complete")
        }
      })

      test("when generation completes, it delivers the complete CSV", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        vi.spyOn(PreApprovalCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , , destination] = args as ConstructorParameters<typeof PreApprovalCsvService>
            await streamCsv(destination, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        // Act
        const response = await fetch(
          `${baseUrl}/api/downloads/travel-authorization-pre-approvals?format=csv`,
          {
            method: "POST",
            signal: AbortSignal.timeout(5000),
          }
        )
        const content = await response.arrayBuffer()
        const csv = Buffer.from(content)

        // Assert
        expect(response.status).toEqual(200)
        expect(csv).toEqual(Buffer.from("\uFEFFName\r\nTraveller\r\nLast traveller\r\n"))
      })

      test("when generation fails after headers arrive, it rejects the partial download", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(PreApprovalCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [, , , , destination] = args as ConstructorParameters<typeof PreApprovalCsvService>
            destination.write("\uFEFFName\r\n")
            await completion
          }
        )

        try {
          // Act
          const response = await fetch(
            `${baseUrl}/api/downloads/travel-authorization-pre-approvals?format=csv`,
            {
              method: "POST",
              signal: AbortSignal.timeout(5000),
            }
          )
          generation.emit("error", new Error("CSV generation failed"))

          // Assert
          await expect(response.arrayBuffer()).rejects.toThrow("terminated")
        } finally {
          generation.emit("complete")
        }
      })
    })
  })
})
