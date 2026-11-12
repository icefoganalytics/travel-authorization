import { type AxiosRequestConfig } from "axios"

import httpClient from "@/api/http-client"

vi.mock("@/api/http-client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

export function mockHttpClient() {
  const httpClientMock = vi.mocked(httpClient, true)

  httpClientMock.get.mockResolvedValue({ data: {} })
  httpClientMock.post.mockResolvedValue({ data: {} })
  httpClientMock.put.mockResolvedValue({ data: {} })
  httpClientMock.patch.mockResolvedValue({ data: {} })
  httpClientMock.delete.mockResolvedValue({ data: {} })

  return httpClientMock
}

type HttpGetRouteHandler = (config: AxiosRequestConfig<unknown> | undefined) => unknown

export function mockHttpGetRoute(url: string, handler: HttpGetRouteHandler) {
  mockHttpGetRoutes({ [url]: handler })
}

/** Callbacks return payloads; unmatched URLs retain the previous GET implementation. */
export function mockHttpGetRoutes(routes: Record<string, HttpGetRouteHandler>) {
  const getMock = vi.mocked(httpClient.get)
  const previousImplementation = getMock.getMockImplementation()

  getMock.mockImplementation(async (url, config) => {
    if (Object.hasOwn(routes, url)) {
      const payload = await routes[url](config)
      return { data: payload }
    }

    if (previousImplementation) {
      return previousImplementation(url, config)
    }

    throw new Error(`Unmocked GET ${url}`)
  })
}

export default mockHttpClient
