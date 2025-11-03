import http from "@/api/http-client"

import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

/** Keep in sync with api/src/models/flight-statistic-job.ts */
export type FlightStatisticJob = {
  id: number
  progress: number
  updatedAt: string
  createdAt: string
}

export type FlightStatisticJobWhereOptions = WhereOptions<FlightStatisticJob, "id" | "progress">

/** add as needed, must match model scopes */
export type FlightStatisticJobFiltersOptions = FiltersOptions<Record<never, never>>

export type FlightStatisticJobQueryOptions = QueryOptions<
  FlightStatisticJobWhereOptions,
  FlightStatisticJobFiltersOptions
>

export const jobsApi = {
  async list(params: FlightStatisticJobQueryOptions = {}): Promise<{
    flightStatisticJobs: FlightStatisticJob[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/flight-statistics-jobs", { params })
    return data
  },
  async create(): Promise<{
    flightStatisticJob: FlightStatisticJob
  }> {
    const { data } = await http.post("/api/flight-statistics-jobs")
    return data
  },
}

export default jobsApi
