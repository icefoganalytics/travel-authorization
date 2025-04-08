import http from "@/api/http-client"

/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * @typedef {{
 *   id: number;
 *   purpose: string;
 *   createdAt: string;
 *   updatedAt: string;
 * }} TravelPurpose
 */

/**
 * @typedef {{
 *   id?: number;
 *   purpose?: string;
 * }} TravelPurposeWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 * }} TravelPurposeFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelPurposeWhereOptions;
 *   filters?: TravelPurposeFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} TravelPurposesQueryOptions
 */

export const travelPurposesApi = {
  /**
   * @param {TravelPurposesQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelPurposes: TravelPurpose[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-purposes", { params })
    return data
  },
  /**
   * @param {number} travelPurposeId
   * @returns {Promise<{
   *   travelPurpose: TravelPurpose;
   * }>}
   */
  async get(travelPurposeId) {
    const { data } = await http.get(`api/travel-purposes/${travelPurposeId}`)
    return data
  },
}

export default travelPurposesApi
