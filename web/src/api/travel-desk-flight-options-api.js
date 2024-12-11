import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */

export const DOES_NOT_WORK = 0

/**
 * Keep in sync with api/src/models/travel-desk-flight-option.ts
 * @typedef {{
 *   id: number;
 *   flightRequestId: number;
 *   travelerId: number;
 *   cost: string;
 *   leg: string;
 *   duration: string;
 *   flightPreferenceOrder: string | null;
 *   additionalInformation: string | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} TravelDeskFlightOption
 */

/**
 * @typedef {{
 *   id?: number;
 *   flightRequestId?: number;
 *   travelerId?: number;
 *   leg?: string;
 *   flightPreferenceOrder?: string | null;
 * }} TravelDeskFlightOptionWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 * }} TravelDeskFlightOptionFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelDeskFlightOptionWhereOptions;
 *   filters?: TravelDeskFlightOptionFiltersOptions;
 *   page?: number;
 *   perPage?: number
 * }} TravelDeskFlightOptionsQueryOptions
 */

export const travelDeskFlightOptionsApi = {
  /**
   * @param {TravelDeskFlightOptionsQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelDeskFlightOptions: TravelDeskFlightOption[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-desk-flight-options", {
      params,
    })
    return data
  },

  /**
   * @param {number} travelDeskFlightOptionId
   * @returns {Promise<{
   *   travelDeskFlightOption: TravelDeskFlightOption;
   *   policy: Policy;
   * }>}
   */
  async get(travelDeskFlightOptionId) {
    const { data } = await http.get(`/api/travel-desk-flight-options/${travelDeskFlightOptionId}`)
    return data
  },

  /**
   * @param {Partial<TravelDeskFlightOption>} attributes
   * @returns {Promise<{
   *   travelDeskFlightOption: TravelDeskFlightOption;
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/travel-desk-flight-options", attributes)
    return data
  },

  /**
   * @param {number} travelDeskFlightOptionId
   * @param {Partial<TravelDeskFlightOption>} attributes
   * @returns {Promise<{
   *   travelDeskFlightOption: TravelDeskFlightOption;
   * }>}
   */
  async update(travelDeskFlightOptionId, attributes) {
    const { data } = await http.patch(
      `/api/travel-desk-flight-options/${travelDeskFlightOptionId}`,
      attributes
    )
    return data
  },

  /**
   * @param {number} travelDeskFlightOptionId
   * @returns {Promise<void>}
   */
  async delete(travelDeskFlightOptionId) {
    await http.delete(`/api/travel-desk-flight-options/${travelDeskFlightOptionId}`)
  },
}

export default travelDeskFlightOptionsApi
