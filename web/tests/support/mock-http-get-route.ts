import { type AxiosRequestConfig } from "axios"

import mockHttpGetRoutes, { type HttpGetRouteHandler } from "./mock-http-get-routes"

export function mockHttpGetRoute(
  url: string,
  handler: HttpGetRouteHandler,
  matchingConfig?: AxiosRequestConfig<unknown>
) {
  mockHttpGetRoutes({ [url]: handler }, matchingConfig)
}

export default mockHttpGetRoute
