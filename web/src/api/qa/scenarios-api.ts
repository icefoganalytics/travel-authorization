import http from "@/api/http-client"

export type Scenario = string

export const scenariosApi = {
  async list(): Promise<{
    scenarios: Scenario[]
  }> {
    const { data } = await http.get("/api/qa/scenarios")
    return data
  },

  // Non-standard, but convenient for this hacky feature.
  async create(scenario: string): Promise<{
    scenarios: Scenario[]
  }> {
    const { data } = await http.post(`/api/qa/scenarios/${scenario}`)
    return data
  },
}

export default scenariosApi
