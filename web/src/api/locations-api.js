import http from "@/api/http-client"

import debounceWithArgsCache from "@/utils/debounce-with-args-cache"

/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * @typedef {{
 *   id: number;
 *   province: string;
 *   city: string;
 *   createdAt: string;
 *   updatedAt: string;
 * }} Location
 */

/**
 * @typedef {{
 *   id?: number;
 *   province?: string;
 *   city?: string;
 * }} LocationWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   byProvince?: string | string[];
 * }} LocationFiltersOptions
 */

/**
 * @typedef {{
 *   where?: LocationWhereOptions;
 *   filters?: LocationFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} LocationsQueryOptions
 */

export const locationsApi = {
  /**
   * @param {LocationsQueryOptions} [params={}]
   * @returns {Promise<{
   *   locations: Location[];
   *   totalCount: number;
   * }}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/locations", { params })
    return data
  },

  /**
   * @param {number} locationId
   * @returns {Promise<Location>}
   */
  async fetch(locationId) {
    const { data } = await http.get(`/api/locations/${locationId}`)
    return data
  },
}

locationsApi.list = debounceWithArgsCache(locationsApi.list, {
  trailing: false,
})

export default locationsApi
