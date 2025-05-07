import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */

/** Keep in sync with api/src/models/travel-authorization.ts */
export const STATUSES = Object.freeze({
  APPROVED: "approved",
  AWAITING_DIRECTOR_APPROVAL: "awaiting_director_approval",
  BOOKED: "booked",
  CHANGE_REQUESTED: "change_requested",
  DENIED: "denied",
  DRAFT: "draft",
  EXPENSE_CLAIM_SUBMITTED: "expense_claim_submitted",
  EXPENSE_CLAIM_APPROVED: "expense_claim_approved",
  EXPENSE_CLAIM_DENIED: "expense_claim_denied",
  EXPENSED: "expensed",
  SUBMITTED: "submitted",
})

export const TRIP_TYPES = Object.freeze({
  ROUND_TRIP: "round_trip",
  ONE_WAY: "one_way",
  MULTI_CITY: "multi_city",
})

/** @typedef {STATUSES[keyof STATUSES]} Statuses */
/** @typedef {TRIP_TYPES[keyof TRIP_TYPES]} TripTypes */

/**
 * @typedef {{
 *   id: string;
 *   userId: string;
 *   createdBy: string | null;
 *   purposeId: string | null;
 *   preApprovalProfileId: string | null;
 *   slug: string;
 *   firstName: string | null;
 *   lastName: string | null;
 *   department: string | null;
 *   division: string | null;
 *   branch: string | null;
 *   unit: string | null;
 *   email: string | null;
 *   mailcode: string | null;
 *   daysOffTravelStatusEstimate: number | null;
 *   daysOffTravelStatusActual: number | null;
 *   dateBackToWorkEstimate: string | null;
 *   dateBackToWorkActual: string | null;
 *   travelDurationEstimate: string | null;
 *   travelDurationActual: string | null;
 *   travelAdvance: string | null;
 *   eventName: string | null;
 *   summary: string | null;
 *   benefits: string | null;
 *   status: Statuses;
 *   wizardStepName: string | null;
 *   supervisorEmail: string | null;
 *   requestChange: string | null;
 *   denialReason: string | null;
 *   tripTypeEstimate: TripTypes | null;
 *   tripTypeActual: TripTypes | null;
 *   travelAdvanceInCents: string | null;
 *   allTravelWithinTerritory: boolean | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} TravelAuthorization
 */

/**
 * @typedef {{
 *   id?: number;
 *   userId?: number;
 *   createdBy?: number;
 *   purposeId?: number;
 *   preApprovalProfileId?: number;
 *   slug?: string;
 *   firstName?: string;
 *   lastName?: string;
 *   department?: string;
 *   division?: string;
 *   branch?: string;
 *   unit?: string;
 *   email?: string;
 *   mailcode?: string;
 *   status?: Statuses;
 *   wizardStepName?: string;
 *   supervisorEmail?: string;
 *   tripTypeEstimate?: TripTypes;
 *   tripTypeActual?: TripTypes;
 *   allTravelWithinTerritory?: boolean;
 * }} TravelAuthorizationWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 * }} TravelAuthorizationFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelAuthorizationWhereOptions;
 *   filters?: TravelAuthorizationFiltersOptions;
 *   page?: number;
 *   perPage?: number
 * }} TravelAuthorizationsQueryOptions
 */

export const travelAuthorizationsApi = {
  STATUSES,
  TRIP_TYPES,
  /**
   * @param {TravelAuthorizationsQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelAuthorizations: TravelAuthorization[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-authorizations", {
      params,
    })
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   *   policy: Policy;
   * }>}
   */
  async get(travelAuthorizationId, params = {}) {
    const { data } = await http.get(`/api/travel-authorizations/${travelAuthorizationId}`, {
      params,
    })
    return data
  },
  /**
   * @param {Partial<TravelAuthorization>} attributes
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/travel-authorizations", attributes)
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @param {Partial<TravelAuthorization>} attributes
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async update(travelAuthorizationId, attributes) {
    const { data } = await http.patch(
      `/api/travel-authorizations/${travelAuthorizationId}`,
      attributes
    )
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @returns {Promise<void>}
   */
  async delete(travelAuthorizationId) {
    const { data } = await http.delete(`/api/travel-authorizations/${travelAuthorizationId}`)
    return data
  },
  // State Management Actions
  /**
   * @param {number} travelAuthorizationId
   * @param {Partial<TravelAuthorization>} attributes
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async submit(travelAuthorizationId, attributes) {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/submit`,
      attributes
    )
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async revertToDraft(travelAuthorizationId) {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/revert-to-draft`
    )
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async approve(travelAuthorizationId) {
    const { data } = await http.post(`/api/travel-authorizations/${travelAuthorizationId}/approve`)
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async approveExpenseClaim(travelAuthorizationId) {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/approve-expense-claim`
    )
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @param {Partial<TravelAuthorization>} attributes
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async deny(travelAuthorizationId, { denialReason } = {}) {
    const { data } = await http.post(`/api/travel-authorizations/${travelAuthorizationId}/deny`, {
      denialReason,
    })
    return data
  },
  /**
   * @param {number} travelAuthorizationId
   * @param {Partial<TravelAuthorization>} attributes
   * @returns {Promise<{
   *   travelAuthorization: TravelAuthorization;
   * }>}
   */
  async expenseClaim(travelAuthorizationId, attributes) {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/expense-claim`,
      attributes
    )
    return data
  },
}

export default travelAuthorizationsApi
