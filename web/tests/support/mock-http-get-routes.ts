import { type AxiosRequestConfig } from "axios"
import { isMatch } from "lodash"

import httpClient from "@/api/http-client"

export type HttpGetRouteHandler = (config: AxiosRequestConfig<unknown> | undefined) => unknown

export function mockHttpGetRoutes(
  routes: Record<string, HttpGetRouteHandler>,
  matchingConfig?: AxiosRequestConfig<unknown>
) {
  const getMock = vi.mocked(httpClient.get)
  const previousImplementation = getMock.getMockImplementation()

  getMock.mockImplementation(async (url, config) => {
    if (
      Object.hasOwn(routes, url) &&
      (matchingConfig === undefined || isMatch(config ?? {}, matchingConfig))
    ) {
      const payload = await routes[url](config)
      return { data: payload }
    }

    if (previousImplementation) {
      return previousImplementation(url, config)
    }

    throw new Error(`Unmocked GET ${url}`)
  })
}

export default mockHttpGetRoutes
