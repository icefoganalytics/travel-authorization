import http from "@/api/http-client"
import { type Policy, type QueryOptions, type WhereOptions } from "@/api/base-api"

export type TravelDeskProductType = {
  id: number
  code: string
  name: string
  description: string | null
}

export type TravelDeskProductTypeWhereOptions = WhereOptions<
  TravelDeskProductType,
  "id" | "code" | "name"
>
export type TravelDeskProductTypesQueryOptions = QueryOptions<
  TravelDeskProductTypeWhereOptions,
  Record<never, never>
>
export type TravelDeskProductTypeCreateAttributes = Pick<
  TravelDeskProductType,
  "code" | "name" | "description"
>
export type TravelDeskProductTypeUpdateAttributes = Pick<
  TravelDeskProductType,
  "name" | "description"
>

export const travelDeskProductTypesApi = {
  async list(params: TravelDeskProductTypesQueryOptions = {}): Promise<{
    travelDeskProductTypes: TravelDeskProductType[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-product-types", { params })
    return data
  },

  async get(travelDeskProductTypeId: number): Promise<{
    travelDeskProductType: TravelDeskProductType
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-product-types/${travelDeskProductTypeId}`)
    return data
  },

  async create(attributes: TravelDeskProductTypeCreateAttributes): Promise<{
    travelDeskProductType: TravelDeskProductType
  }> {
    const { data } = await http.post("/api/travel-desk-product-types", attributes)
    return data
  },

  async update(
    travelDeskProductTypeId: number,
    attributes: TravelDeskProductTypeUpdateAttributes
  ): Promise<{ travelDeskProductType: TravelDeskProductType }> {
    const { data } = await http.patch(
      `/api/travel-desk-product-types/${travelDeskProductTypeId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskProductTypeId: number): Promise<void> {
    await http.delete(`/api/travel-desk-product-types/${travelDeskProductTypeId}`)
  },
}

export default travelDeskProductTypesApi
