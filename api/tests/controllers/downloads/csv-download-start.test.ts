import { EventEmitter, once } from "node:events"
import { type Server } from "node:http"
import { type AddressInfo } from "node:net"

import { User } from "@/models"
import { CreateCsvService as ReconciliationCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import { CreateCsvService as StatisticsCsvService } from "@/services/downloads/flight-statistics/create-csv-service"
import { CreateCsvService as PreApprovalCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"

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
    test("when generation is pending, it starts the attachment before delivering the completed CSV", async () => {
      // Arrange
      const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
      mockCurrentUser(user)
      const generation = new EventEmitter()
      const csv = Buffer.from("\uFEFFName\r\nTraveller\r\n")
      const generateCsv = vi.spyOn(service, "perform").mockImplementation(async () => {
        await once(generation, "ready")
        return csv
      })
      const signal = AbortSignal.timeout(5000)

      try {
        // Act
        const response = await fetch(`${baseUrl}/api/downloads/${resource}?format=csv`, {
          method: "POST",
          signal,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.headers.get("content-disposition")).toMatch(/^attachment; filename=".*\.csv"$/)
        expect(response.headers.get("content-type")).toEqual("text/csv; charset=utf-8")
        if (response.body === null) {
          throw new Error("Expected a CSV response body")
        }

        const reader = response.body.getReader()
        let chunk = await reader.read()
        expect(chunk.value).toEqual(new Uint8Array([239, 187, 191]))
        generation.emit("ready")
        const chunks: Uint8Array[] = []
        while (!chunk.done) {
          chunks.push(chunk.value)
          chunk = await reader.read()
        }
        expect(Buffer.concat(chunks)).toEqual(csv)
      } finally {
        generation.emit("ready")
        generateCsv.mockRestore()
      }
    })

    test("when generation fails after headers arrive, it fails the download instead of saving an error file", async () => {
      // Arrange
      const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
      mockCurrentUser(user)
      const generation = new EventEmitter()
      const generateCsv = vi.spyOn(service, "perform").mockImplementation(async () => {
        await once(generation, "ready")
        return Buffer.alloc(0)
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
