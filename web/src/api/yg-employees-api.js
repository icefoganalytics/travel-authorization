import http from "@/api/http-client"

/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * @typedef {{
 *   id: number;
 *   email: string;
 *   username: string;
 *   fullName: string;
 *   firstName: string;
 *   lastName: string;
 *   department: string;
 *   division: string | null;
 *   branch: string | null;
 *   unit: string | null;
 *   organization: string | null;
 *   title: string | null;
 *   suite: string | null;
 *   phoneOffice: string | null;
 *   faxOffice: string | null;
 *   mobile: string | null;
 *   office: string | null;
 *   address: string | null;
 *   poBox: string | null;
 *   community: string | null;
 *   postalCode: string | null;
 *   latitude: string | null;
 *   longitude: string | null;
 *   mailcode: string | null;
 *   manager: string | null;
 *   lastSyncSuccessAt: string | null;
 *   lastSyncFailureAt: string | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} YgEmployee
 */

/**
 * @typedef {Pick<
 *   YgEmployee,
 *   | "id"
 *   | "firstName"
 *   | "lastName"
 *   | "department"
 *   | "fullName"
 *   | "email"
 *   | "mobile"
 *   | "office"
 *   | "address"
 *   | "community"
 *   | "postalCode"
 *   | "lastSyncSuccessAt"
 *   | "lastSyncFailureAt"
 *   | "createdAt"
 *   | "updatedAt"
 * > & {
 *   businessPhone: YgEmployee["phoneOffice"]
 * }} YgEmployeeAsShow
 */

/**
 * @typedef {Pick<
 *   YgEmployee,
 *   | "id"
 *   | "firstName"
 *   | "lastName"
 *   | "department"
 *   | "fullName"
 *   | "email"
 *   | "lastSyncSuccessAt"
 *   | "lastSyncFailureAt"
 *   | "createdAt"
 *   | "updatedAt"
 * > & {
 *   businessPhone: YgEmployee["phoneOffice"]
 * }} YgEmployeeAsIndex
 */

/**
 * @typedef {{
 *   id?: number | number[];
 *   email?: string | string[];
 *   department?: string | string[];
 *   division?: string | string[] | null;
 *   branch?: string | string[] | null;
 *   unit?: string | string[] | null;
 * }} YgEmployeeWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   search?: string | string[]
 * }} YgEmployeeFiltersOptions
 */

/**
 * @typedef {{
 *   where?: YgEmployeeWhereOptions;
 *   filters?: YgEmployeeFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} YgEmployeesQueryOptions
 */

export const ygEmployeesApi = {
  /**
   * @param {YgEmployeesQueryOptions} [params={}]
   * @returns {Promise<{
   *   ygEmployees: YgEmployeeAsIndex[];
   *   totalCount: number;
   * }}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/yg-employees", { params })
    return data
  },

  /**
   * @param {number} ygEmployeeId
   * @returns {Promise<YgEmployeeAsShow>}
   */
  async fetch(ygEmployeeId) {
    const { data } = await http.get(`/api/yg-employees/${ygEmployeeId}`)
    return data
  },
}

export default ygEmployeesApi
