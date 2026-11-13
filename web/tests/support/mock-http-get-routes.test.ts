import { flushPromises } from "@vue/test-utils"

import httpClient from "@/api/http-client"

import mockHttpGetRoute from "@/tests/support/mock-http-get-route"
import mockHttpGetRoutes from "@/tests/support/mock-http-get-routes"

describe("web/tests/support/mock-http-get-routes.ts", () => {
  describe.each([
    {
      name: "mockHttpGetRoute",
      register: mockHttpGetRoute,
    },
    {
      name: "mockHttpGetRoutes",
      register: (url: string, handler: Parameters<typeof mockHttpGetRoute>[1]) => {
        mockHttpGetRoutes({ [url]: handler })
      },
    },
  ])("$name", ({ register }) => {
    test("when distinct routes are registered sequentially, both responses remain available", async () => {
      // Arrange
      register("/api/first", () => ({ id: 1 }))
      register("/api/second", () => ({ id: 2 }))

      // Act
      const responses = await Promise.all([
        httpClient.get("/api/first"),
        httpClient.get("/api/second"),
      ])

      // Assert
      expect(responses).toEqual([{ data: { id: 1 } }, { data: { id: 2 } }])
    })

    test("when mixed registrations overlap, the latest response wins without losing other routes", async () => {
      // Arrange
      mockHttpGetRoutes({
        "/api/first": () => ({ id: 1 }),
        "/api/second": () => ({ id: 2 }),
      })
      mockHttpGetRoute("/api/first", () => ({ id: 3 }))
      register("/api/first", () => ({ id: 4 }))

      // Act
      const responses = await Promise.all([
        httpClient.get("/api/first"),
        httpClient.get("/api/second"),
      ])

      // Assert
      expect(responses).toEqual([{ data: { id: 4 } }, { data: { id: 2 } }])
    })

    test("when the URL is unmatched, the previous GET response is returned unchanged", async () => {
      // Arrange
      const sharedResponse = { data: { authenticated: true }, status: 200 }
      vi.mocked(httpClient.get).mockResolvedValue(sharedResponse)
      register("/api/first", () => ({ id: 1 }))

      // Act
      const response = await httpClient.get("/api/session")

      // Assert
      expect(response).toBe(sharedResponse)
    })

    test("when a GET route is registered, an existing POST response remains available", async () => {
      // Arrange
      vi.mocked(httpClient.post).mockResolvedValue({ data: { id: 7 } })
      register("/api/first", () => ({ id: 1 }))

      // Act
      const response = await httpClient.post("/api/first", { name: "New record" })

      // Assert
      expect(response).toEqual({ data: { id: 7 } })
    })

    test.each(["/api/first/7", "/api/first/", "/api/first?active=true", "toString"])(
      "when %s does not exactly match a registered URL, the shared fallback answers",
      async (url) => {
        // Arrange
        vi.mocked(httpClient.get).mockResolvedValue({ data: { fallback: true } })
        register("/api/first", () => ({ id: 1 }))

        // Act
        const response = await httpClient.get(url)

        // Assert
        expect(response).toEqual({ data: { fallback: true } })
      }
    )

    test("when the request has query options, the callback can select the matching response", async () => {
      // Arrange
      register("/api/flights", (configuration) => {
        if (configuration?.params.order[0][0] === "arriveAt") {
          return { flights: [{ id: 8 }] }
        }

        return { flights: [{ id: 3 }] }
      })

      // Act
      const response = await httpClient.get("/api/flights", {
        params: { order: [["arriveAt", "DESC"]] },
      })

      // Assert
      expect(response).toEqual({ data: { flights: [{ id: 8 }] } })
    })

    test("when the payload has its own data field, it remains inside the Axios envelope", async () => {
      // Arrange
      register("/api/first", () => ({ data: { id: 1 } }))

      // Act
      const response = await httpClient.get("/api/first")

      // Assert
      expect(response).toEqual({ data: { data: { id: 1 } } })
    })

    test("when the callback response is pending, the GET response remains pending", async () => {
      // Arrange
      const deferredResponse = Promise.withResolvers<{ id: number }>()
      register("/api/first", () => deferredResponse.promise)

      // Act
      const response = httpClient.get("/api/first")
      await flushPromises()
      const result = await Promise.race([response, Promise.resolve("pending")])

      // Assert
      try {
        expect(result).toBe("pending")
      } finally {
        deferredResponse.resolve({ id: 1 })
        await response
      }
    })

    test("when the callback response resolves later, the GET response contains its payload", async () => {
      // Arrange
      const deferredResponse = Promise.withResolvers<{ id: number }>()
      register("/api/first", () => deferredResponse.promise)

      // Act
      const response = httpClient.get("/api/first")
      await flushPromises()
      deferredResponse.resolve({ id: 1 })

      // Assert
      await expect(response).resolves.toEqual({ data: { id: 1 } })
    })

    test("when the callback throws, the caller receives the same error", async () => {
      // Arrange
      const error = new Error("Unavailable")
      register("/api/first", () => {
        throw error
      })

      // Act / Assert
      await expect(httpClient.get("/api/first")).rejects.toBe(error)
    })

    test("when the callback rejects, the caller receives the same error", async () => {
      // Arrange
      const error = new Error("Unavailable")
      register("/api/first", () => Promise.reject(error))

      // Act / Assert
      await expect(httpClient.get("/api/first")).rejects.toBe(error)
    })

    test("when no previous implementation exists, an unmatched URL rejects explicitly", async () => {
      // Arrange
      vi.mocked(httpClient.get).mockRestore()
      register("/api/first", () => ({ id: 1 }))

      // Act / Assert
      await expect(httpClient.get("/api/missing")).rejects.toThrow("Unmocked GET /api/missing")
    })

    test("when a scenario overrides the shared response, its route takes precedence", async () => {
      // Arrange
      register("/api/scenario-only", () => ({ id: 9 }))

      // Act
      const response = await httpClient.get("/api/scenario-only")

      // Assert
      expect(response).toEqual({ data: { id: 9 } })
    })

    test("when the next scenario starts, prior routes are removed and shared defaults answer", async () => {
      // Arrange
      // The configured mock reset and shared setup run before this scenario.

      // Act
      const response = await httpClient.get("/api/scenario-only")

      // Assert
      expect(response).toEqual({ data: {} })
    })
  })
})
