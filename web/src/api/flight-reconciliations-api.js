import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * Keep in sync with api/src/models/flight-reconciliation.ts
 * @typedef {{
 *   id: number;
 *   reconcilerId: number;
 *   externalTravComIdentifier: number;
 *   reconciled: boolean;
 *   reconcilePeriod: number | null;
 *   segmentsComputedFlightInfo: string | null;
 *   segmentsComputedFinalDestination: string | null;
 *   createdAt: string;
 *   updatedAt: string;
 * }} FlightReconciliation
 */

/**
 * @typedef {{
 *   id?: number;
 *   reconcilerId?: number;
 *   externalTravComIdentifier?: number;
 *   reconciled?: boolean;
 *   reconcilePeriod?: number | null;
 * }} FlightReconciliationWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   invoiceBookingDateBetween?: [string, string];
 * }} FlightReconciliationFiltersOptions
 */

/**
 * @typedef {{
 *   where?: FlightReconciliationWhereOptions;
 *   filters?: FlightReconciliationFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} FlightReconciliationsQueryOptions
 */

export const flightReconciliationsApi = {
  /**
   * @param {FlightReconciliationsQueryOptions} [params={}]
   * @returns {Promise<{
   *   flightReconciliations: FlightReconciliation[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/flight-reconciliations", {
      params,
    })
    return data
  },

  /**
   * @param {number} flightReconciliationId
   * @returns {Promise<{
   *   flightReconciliation: FlightReconciliation;
   *   policy: Policy;
   * }>}
   */
  async get(flightReconciliationId) {
    const { data } = await http.get(`/api/flight-reconciliations/${flightReconciliationId}`)
    return data
  },

  /**
   * @param {Partial<FlightReconciliation>} attributes
   * @returns {Promise<{
   *   flightReconciliation: FlightReconciliation;
   * }>}
   */
  async update(flightReconciliationId, attributes) {
    const { data } = await http.patch(
      `/api/flight-reconciliations/${flightReconciliationId}`,
      attributes
    )
    return data
  },

  /**
   * @param {number} flightReconciliationId
   * @returns {Promise<void>}
   */
  async delete(flightReconciliationId) {
    await http.delete(`/api/flight-reconciliations/${flightReconciliationId}`)
  },

  // Special actions
  /**
   * @param {FlightReconciliationsQueryOptions} [query={}]
   * @returns {Promise<{
   *   flightReconciliations: FlightReconciliation[];
   *   totalCount: number;
   * }>}
   */
  async sync(query = {}) {
    const { data } = await http.post("/api/flight-reconciliations/sync", query)
    return data
  },
}

export default flightReconciliationsApi
