import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * @typedef {{
 *   id: number;
 *   preApprovalId: number;
 *   profileName: string;
 *   department: string;
 *   branch: string | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} TravelAuthorizationPreApprovalProfile
 */

/**
 * @typedef {{
 *   id?: number;
 *   preApprovalId?: number;
 *   profileName?: string;
 *   department?: string;
 *   branch?: string | null;
 * }} TravelAuthorizationPreApprovalProfileWhereOptions
 */

/**
 * Must match model scopes signatures
 * @typedef {{
 *  approved?: true;
 *  openDateOrBeforeStartDate?: true;
 * }} TravelAuthorizationPreApprovalProfileFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelAuthorizationPreApprovalProfileWhereOptions;
 *   filters?: TravelAuthorizationPreApprovalProfileFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} TravelAuthorizationPreApprovalProfilesQueryOptions
 */

export const travelAuthorizationPreApprovalProfilesApi = {
  /**
   * @param {TravelAuthorizationPreApprovalProfilesQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalProfiles: TravelAuthorizationPreApprovalProfile[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-authorization-pre-approval-profiles", {
      params,
    })
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalProfileId
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile;
   *   policy: Policy;
   * }>}
   */
  async get(travelAuthorizationPreApprovalProfileId) {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`
    )
    return data
  },

  /**
   * @param {Partial<TravelAuthorizationPreApprovalProfile>} attributes
   * @returns {Promise<{
  *   travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile,
  * }>}
  */
 async create(attributes) {
   const { data } = await http.post(
     "/api/travel-authorization-pre-approval-profiles",
     attributes
   )
   return data
 },

 /**
  * @param {number} travelAuthorizationPreApprovalProfileId
  * @param {Partial<TravelAuthorizationPreApprovalProfile>} attributes
  * @returns {Promise<{
  *   travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile,
  *   policy: Policy,
  * }>}
  */
 async update(travelAuthorizationPreApprovalProfileId, attributes) {
   const { data } = await http.put(
     `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`,
     attributes
   )
   return data
 },

 /**
  * @param {number} travelAuthorizationPreApprovalProfileId
  * @returns {Promise<void>}
  */
 async delete(travelAuthorizationPreApprovalProfileId) {
   const { data } = await http.delete(
     `/api/travel-authorization-pre-approval-profiles/${travelAuthorizationPreApprovalProfileId}`
   )
   return data
 },
}

export default travelAuthorizationPreApprovalProfilesApi
