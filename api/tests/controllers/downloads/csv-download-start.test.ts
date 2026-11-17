import { EventEmitter, once } from "node:events"
import { type Server } from "node:http"
import { type AddressInfo } from "node:net"
import { type Writable } from "node:stream"

import { User } from "@/models"
import { CreateCsvService as ReconciliationCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import { CreateCsvService as StatisticsCsvService } from "@/services/downloads/flight-statistics/create-csv-service"
import { CreateCsvService as PreApprovalCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"
import streamCsv from "@/utils/stream-csv"

import { userFactory } from "@/factories"
import { mockCurrentUser } from "@/support"

import app from "@/app"

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
      server.close((error) => (error ? reject(error) : resolve()))
    })
  })

  describe.each([
    { resource: "flight-reconciliations", service: ReconciliationCsvService },
    { resource: "flight-statistics", service: StatisticsCsvService },
    { resource: "travel-authorization-pre-approvals", service: PreApprovalCsvService },
  ])("$resource", ({ resource, service }) => {
    test("when later rows are pending, it delivers earlier rows before generation finishes", async () => {
      // Arrange
      const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
      mockCurrentUser(user)
      const generation = new EventEmitter()
      const firstRow = once(generation, "firstRow")
      const lastRow = once(generation, "lastRow")
      const generateCsv = vi.spyOn(service, "perform").mockImplementation(async (...args) => {
        const destination = args[args.length - 1] as Writable
        await streamCsv(destination, ["Name"], async (writeRow) => {
          await firstRow
          await writeRow({ Name: "Traveller" })
          await lastRow
          await writeRow({ Name: "Last traveller" })
        })
      })
      const signal = AbortSignal.timeout(5000)

      try {
        // Act
        const response = await fetch(`${baseUrl}/api/downloads/${resource}?format=csv`, {
          method: "POST",
          signal,
        })
        if (response.body === null) {
          throw new Error("Expected a CSV response body")
        }

        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []
        const header = Buffer.from("\uFEFFName")
        let receivedBytes = 0
        while (receivedBytes < header.length) {
          const chunk = await reader.read()
          if (chunk.done) throw new Error("Download ended before the header arrived")
          chunks.push(chunk.value)
          receivedBytes += chunk.value.length
        }

        // Assert
        expect(response.status).toEqual(200)
        expect(Buffer.concat(chunks)).toEqual(header)
        generation.emit("firstRow")
        const firstRows = Buffer.from("\uFEFFName\r\nTraveller")
        while (receivedBytes < firstRows.length) {
          const chunk = await reader.read()
          if (chunk.done) throw new Error("Download ended before the first row arrived")
          chunks.push(chunk.value)
          receivedBytes += chunk.value.length
        }
        expect(Buffer.concat(chunks)).toEqual(firstRows)
        generation.emit("lastRow")
        for (;;) {
          const chunk = await reader.read()
          if (chunk.done) break
          chunks.push(chunk.value)
        }
        expect(Buffer.concat(chunks)).toEqual(
          Buffer.from("\uFEFFName\r\nTraveller\r\nLast traveller\r\n")
        )
      } finally {
        generation.emit("firstRow")
        generation.emit("lastRow")
        generateCsv.mockRestore()
      }
    })

    test("when generation fails after headers arrive, it fails the download instead of saving an error file", async () => {
      // Arrange
      const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
      mockCurrentUser(user)
      const generation = new EventEmitter()
      const generateCsv = vi.spyOn(service, "perform").mockImplementation(async (...args) => {
        const destination = args[args.length - 1] as Writable
        await streamCsv(destination, ["Name"], async () => {
          await once(generation, "ready")
        })
      })
      const signal = AbortSignal.timeout(5000)

      try {
        // Act
        const response = await fetch(`${baseUrl}/api/downloads/${resource}?format=csv`, {
          method: "POST",
          signal,
        })
        generation.emit("error", new Error("CSV generation failed"))

        // Assert
        await expect(response.arrayBuffer()).rejects.toThrow("terminated")
      } finally {
        generation.emit("ready")
        generateCsv.mockRestore()
      }
    })
  })
})
