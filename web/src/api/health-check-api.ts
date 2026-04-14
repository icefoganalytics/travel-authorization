import http from "@/api/http-client"

export type AppHealth = {
  apiPort?: string
  frontendUrl?: string
  nodeEnd?: string
}

export type DbHealth = {
  connection?: string
  database?: string
  user?: string
  port?: string
}

export type HealthCheck = {
  appHealth: AppHealth
  dbHealth: DbHealth
}

export const healthCheckApi = {
  async get(): Promise<{
    healthCheck: HealthCheck
  }> {
    const data = await http.get("/api/health-check")

    return {
      healthCheck: data.data,
    }
  },
}

export default healthCheckApi
