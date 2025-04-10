import http from "@/api/http-client"

/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * @typedef {{
 *   id: number;
 *   department: string;
 *   division: string | null;
 *   branch: string | null;
 *   unit: string | null;
 *   order: number;
 *   lastSyncSuccessAt: string | null;
 *   lastSyncFailureAt: string | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} YgEmployeeGroup
 */

/**
 * @typedef {Pick<
 *   YgEmployeeGroup,
 *   | "id"
 *   | "department"
 *   | "division"
 *   | "branch"
 *   | "unit"
 *   | "order"
 *   | "lastSyncSuccessAt"
 *   | "lastSyncFailureAt"
 *   | "createdAt"
 *   | "updatedAt"
 * >} YgEmployeeGroupAsShow
 */

/**
 * @typedef {Pick<
 *   YgEmployeeGroup,
 *   | "id"
 *   | "department"
 *   | "division"
 *   | "branch"
 *   | "unit"
 *   | "order"
 *   | "lastSyncSuccessAt"
 *   | "lastSyncFailureAt"
 *   | "createdAt"
 *   | "updatedAt"
 * >} YgEmployeeGroupAsIndex
 */

/**
 * @typedef {{
 *   id?: number | number[];
 *   department?: string | string[];
 *   division?: string | string[] | null;
 *   branch?: string | string[] | null;
 *   unit?: string | string[] | null;
 *   order?: number | number[];
 * }} YgEmployeeGroupWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   search?: string | string[]
 *   isDepartment?: boolean
 *   isDivision?: boolean
 *   isBranch?: boolean
 *   isUnit?: boolean
 * }} YgEmployeeGroupFiltersOptions
 */

/**
 * @typedef {{
 *   where?: YgEmployeeGroupWhereOptions;
 *   filters?: YgEmployeeGroupFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} YgEmployeeGroupsQueryOptions
 */

export const ygEmployeeGroupsApi = {
  /**
   * @param {YgEmployeeGroupsQueryOptions} [params={}]
   * @returns {Promise<{
   *   ygEmployeeGroups: YgEmployeeGroupAsIndex[];
   *   totalCount: number;
   * }}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/yg-employee-groups", { params })
    return data
  },

  /**
   * @param {number} ygEmployeeId
   * @returns {Promise<YgEmployeeGroupAsShow>}
   */
  async fetch(ygEmployeeId) {
    const { data } = await http.get(`/api/yg-employee-groups/${ygEmployeeId}`)
    return data
  },

  // Special actions
  /**
   * @returns {Promise<void>}
   */
  async sync() {
    const { data } = await http.post("/api/yg-employee-groups/sync")
    return data
  },
}

export default ygEmployeeGroupsApi
