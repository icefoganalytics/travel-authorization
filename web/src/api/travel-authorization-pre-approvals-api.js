import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/** @typedef {import('@/api/travel-authorization-pre-approval-submissions-api.js').TravelAuthorizationPreApprovalSubmission} TravelAuthorizationPreApprovalSubmission */

/** Keep in sync with api/src/models/travel-authorization-pre-approval.ts */
export const TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  DECLINED: "declined",
})

/** @typedef {TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES[keyof TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES]} TravelAuthorizationPreApprovalStatuses */

/**
 * Keep in sync with api/src/models/travel-authorization-pre-approval.ts
 * @typedef {{
 *   id: number,
 *   estimatedCost: number,
 *   location: string,
 *   department: string | null,
 *   branch: string | null,
 *   purpose: string | null,
 *   reason: string | null,
 *   startDate: string | null,
 *   endDate: string | null,
 *   isOpenForAnyDate: boolean,
 *   month: string | null,
 *   isOpenForAnyTraveler: boolean,
 *   numberTravelers: number | null,
 *   travelerNotes: string | null,
 *   status: TravelAuthorizationPreApprovalStatuses,
 *   createdAt: string,
 *   updatedAt: string,
 * }} TravelAuthorizationPreApproval
 */

/**
 * @typedef {TravelAuthorizationPreApproval & {
 *   submission: TravelAuthorizationPreApprovalSubmission
 * }} TravelAuthorizationPreApprovalAsShow
 */

/**
 * @typedef {{
 *   id?: number,
 *   location?: string,
 *   department?: string | null,
 *   branch?: string | null,
 *   startDate?: string | null,
 *   endDate?: string | null,
 *   isOpenForAnyDate?: boolean,
 *   month?: string | null,
 *   isOpenForAnyTraveler?: boolean,
 *   numberTravelers?: number | null,
 *   status?: TravelAuthorizationPreApprovalStatuses,
 * }} TravelAuthorizationPreApprovalWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{}} TravelAuthorizationPreApprovalFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelAuthorizationPreApprovalWhereOptions,
 *   filters?: TravelAuthorizationPreApprovalFiltersOptions,
 *   order?: ModelOrder[],
 *   page?: number,
 *   perPage?: number,
 * }} TravelAuthorizationPreApprovalsQueryOptions
 */

export const travelAuthorizationPreApprovalsApi = {
  STATUSES: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,

  /**
   * @param {TravelAuthorizationPreApprovalsQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelAuthorizationPreApprovals: TravelAuthorizationPreApproval[],
   *   totalCount: number,
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-authorization-pre-approvals", {
      params,
    })
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalId
   * @returns {Promise<{
   *   travelAuthorizationPreApproval: TravelAuthorizationPreApprovalAsShow,
   *   policy: Policy,
   * }>
   */
  async get(travelAuthorizationPreApprovalId) {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },

  /**
   * @param {Partial<TravelAuthorizationPreApproval>} attributes
   * @returns {Promise<{
   *   travelAuthorizationPreApproval: TravelAuthorizationPreApproval,
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/travel-authorization-pre-approvals", attributes)
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalId
   * @param {Partial<TravelAuthorizationPreApproval>} attributes
   * @returns {Promise<{
   *   travelAuthorizationPreApproval: TravelAuthorizationPreApproval,
   * }>}
   */
  async update(travelAuthorizationPreApprovalId, attributes) {
    const { data } = await http.patch(
      `/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`,
      attributes
    )
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalId
   * @returns {Promise<void>}
   */
  async delete(travelAuthorizationPreApprovalId) {
    const { data } = await http.delete(
      `/api/travel-authorization-pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
}

export default travelAuthorizationPreApprovalsApi
