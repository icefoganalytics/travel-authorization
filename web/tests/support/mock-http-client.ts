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

export default mockHttpClient
