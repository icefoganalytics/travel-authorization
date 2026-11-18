import qs from "qs"
import supertest, { AgentOptions, type Test } from "supertest"
import { App } from "supertest/types"

import defaultApp from "@/app"

export function request(options?: AgentOptions | undefined, app: App = defaultApp) {
  return supertest.agent(app, options).use((request: Test) => {
    const query = request.query.bind(request)
    request.query = (values) =>
      query(
        typeof values === "string"
          ? values
          : qs.stringify(values, { indices: true, strictNullHandling: true })
      )
  })
}

export default request
