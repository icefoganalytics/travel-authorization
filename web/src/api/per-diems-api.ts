import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** @deprecated - prefer enum equivalent `ClaimTypes` */
export const PER_DIEM_CLAIM_TYPES = Object.freeze({
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  INCIDENTALS: "incidentals",
  PRIVATE_ACCOMMODATIONS: "private_accommodations",
})

/** @deprecated - prefer enum equivalent `TravelRegions` */
export const PER_DIEM_TRAVEL_REGIONS = Object.freeze({
  US: "US",
  YUKON: "Yukon",
  NWT: "NWT",
  CANADA: "Canada",
  NUNAVUT: "Nunavut",
  ALASKA: "Alaska",
})

/** @deprecated - prefer enum equivalent `CurrencyTypes` */
export const PER_DIEM_CURRENCY_TYPES = Object.freeze({
  USD: "USD",
  CAD: "CAD",
})

/** Keep in sync with api/src/models/per-diem.ts */
export enum ClaimTypes {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  INCIDENTALS = "incidentals",
  PRIVATE_ACCOMMODATIONS = "private_accommodations",
}

/** Keep in sync with api/src/models/per-diem.ts */
export enum TravelRegions {
  US = "US",
  YUKON = "Yukon",
  NWT = "NWT",
  CANADA = "Canada",
  NUNAVUT = "Nunavut",
  ALASKA = "Alaska",
}

/** Keep in sync with api/src/models/per-diem.ts */
export enum CurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

export type PerDiem = {
  id: string
  claimType: ClaimTypes
  travelRegion: TravelRegions
  amount: number
  currency: CurrencyTypes
  createdAt: string
  updatedAt: string
}

export type PerDiemWhereOptions = WhereOptions<PerDiem, "claimType" | "travelRegion" | "currency">

/** add as needed, must match model scopes */
export type PerDiemFiltersOptions = FiltersOptions<Record<never, never>>

export type PerDiemsQueryOptions = QueryOptions<PerDiemWhereOptions, PerDiemFiltersOptions>

export const perDiemsApi = {
  async list(params: PerDiemsQueryOptions = {}): Promise<{
    perDiems: PerDiem[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/per-diems", {
      params,
    })
    return data
  },

  async get(perDiemId: number): Promise<{
    perDiem: PerDiem
    policy: Policy
  }> {
    const { data } = await http.get(`/api/per-diems/${perDiemId}`)
    return data
  },

  async update(
    perDiemId: number,
    attributes: Partial<PerDiem>
  ): Promise<{
    perDiem: PerDiem
  }> {
    const { data } = await http.patch(`/api/per-diems/${perDiemId}`, attributes)
    return data
  },
}

export default perDiemsApi
