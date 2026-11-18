import qs from "qs"
import supertest, { AgentOptions, type Test } from "supertest"
import { App } from "supertest/types"

import defaultApp from "@/app"

export function request(options?: AgentOptions | undefined, app: App = defaultApp) {
  return supertest.agent(app, options).use((request: Test) => {
    const query = request.query.bind(request)
    request.query = (values) =>
      query(
        qs.stringify(values, {
          arrayFormat: "indices",
          strictNullHandling: true,
          allowEmptyArrays: true,
        })
      )
  })
}

export default request
