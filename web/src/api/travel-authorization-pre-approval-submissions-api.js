import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/** Keep in sync with api/src/models/travel-authorization-pre-approval-submission.ts */
export const TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  FINISHED: "finished",
})

/** @typedef {TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES[keyof TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES]} TravelAuthorizationPreApprovalSubmissionStatus */

/**
 * Keep in sync with api/src/models/travel-authorization-pre-approval-submission.ts
 * @typedef {{
 *   id: number,
 *   creatorId: number,
 *   approverId: number | null,
 *   approvedAt: string | null,
 *   status: TravelAuthorizationPreApprovalSubmissionStatus,
 *   department: string,
 *   createdAt: string,
 *   updatedAt: string,
 * }} TravelAuthorizationPreApprovalSubmission
 */

/**
 * @typedef {{
 *   id?: number,
 *   creatorId?: number,
 *   approverId?: number | null,
 *   status?: TravelAuthorizationPreApprovalSubmissionStatus,
 *   department?: string,
 * }} TravelAuthorizationPreApprovalSubmissionWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{}} TravelAuthorizationPreApprovalSubmissionFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelAuthorizationPreApprovalSubmissionWhereOptions,
 *   filters?: TravelAuthorizationPreApprovalSubmissionFiltersOptions,
 *   order?: ModelOrder[],
 *   page?: number,
 *   perPage?: number,
 * }} TravelAuthorizationPreApprovalSubmissionsQueryOptions
 */

export const travelAuthorizationPreApprovalSubmissionsApi = {
  STATUSES: TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,

  /**
   * @param {TravelAuthorizationPreApprovalSubmissionsQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalSubmissions: TravelAuthorizationPreApprovalSubmission[],
   *   totalCount: number,
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-authorization-pre-approval-submissions", {
      params,
    })
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
   *   policy: Policy,
   * }>}
   */
  async get(travelAuthorizationPreApprovalSubmissionId) {
    const { data } = await http.get(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`
    )
    return data
  },

  /**
   * @param {Partial<TravelAuthorizationPreApprovalSubmission>} attributes
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post(
      "/api/travel-authorization-pre-approval-submissions",
      attributes
    )
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @param {Partial<TravelAuthorizationPreApprovalSubmission>} attributes
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
   *   policy: Policy,
   * }>}
   */
  async update(travelAuthorizationPreApprovalSubmissionId, attributes) {
    const { data } = await http.patch(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`,
      attributes
    )
    return data
  },

  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @returns {Promise<void>}
   */
  async delete(travelAuthorizationPreApprovalSubmissionId) {
    const { data } = await http.delete(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}`
    )
    return data
  },

  // Stateful actions
  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @param {FormData} attributes
   * @returns {Promise<{
   *   travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
   *   policy: Policy,
   * }>}
   */
  async approve(travelAuthorizationPreApprovalSubmissionId, attributes) {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/approve`,
      attributes,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  },
}

export default travelAuthorizationPreApprovalSubmissionsApi
