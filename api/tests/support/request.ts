import qs from "qs"
import supertest, { AgentOptions, type Test } from "supertest"
import { App } from "supertest/types"

import defaultApp from "@/app"

export function request(options?: AgentOptions | undefined, app: App = defaultApp) {
  return supertest.agent(app, options).use((request: Test) => {
    const query = request.query.bind(request)
    request.query = (values) => query(serializeQuery(values))
  })
}

// Keep in sync with serializeQuery in web/src/api/base-api.ts.
function serializeQuery(params: Parameters<Test["query"]>[0]): string {
  return qs.stringify(params, {
    arrayFormat: "indices",
    strictNullHandling: true,
    allowEmptyArrays: true,
  })
}

export default request
