import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/** Keep in sync with api/src/models/travel-segment.ts */
export const TRAVEL_METHODS = {
  AIRCRAFT: "Aircraft",
  POOL_VEHICLE: "Pool Vehicle",
  PERSONAL_VEHICLE: "Personal Vehicle",
  RENTAL_VEHICLE: "Rental Vehicle",
  BUS: "Bus",
  OTHER: "Other", // value stored in modeOfTransportOther
}

/** @typedef {typeof TRAVEL_METHODS[keyof typeof TRAVEL_METHODS]} TravelMethods */

/** Keep in sync with api/src/models/stop.ts */
export const ACCOMMODATION_TYPES = {
  HOTEL: "Hotel",
  PRIVATE: "Private",
  OTHER: "Other", // value stored in accommodationTypeOther
}

/** @typedef {typeof ACCOMMODATION_TYPES[keyof typeof ACCOMMODATION_TYPES]} AccommodationTypes */

export const PERMITTED_ATTRIBUTES_FOR_CLONE = [
  "departureLocationId",
  "arrivalLocationId",
  "departureOn",
  "departureTime",
  "modeOfTransport",
  "modeOfTransportOther",
  "accommodationType",
  "accommodationTypeOther",
]

/**
 * Keep in sync with api/src/models/travel-segment.ts
 * @typedef {{
 *   id: number
 *   travelAuthorizationId: number
 *   departureLocationId: number | null
 *   arrivalLocationId: number | null
 *   segmentNumber: number
 *   departureOn: string | null
 *   departureTime: string | null
 *   modeOfTransport: TravelMethods
 *   modeOfTransportOther: string | null
 *   accommodationType: AccommodationTypes
 *   accommodationTypeOther: string | null
 *   isActual: boolean
 *   createdAt: string
 *   updatedAt: string
 * }} TravelSegment
 */

/**
 * @typedef {{
 *   id?: number
 *   travelAuthorizationId?: number
 *   departureLocationId?: number
 *   arrivalLocationId?: number
 *   segmentNumber?: number
 *   departureOn?: string
 *   departureTime?: string
 *   modeOfTransport?: TravelMethods
 *   modeOfTransportOther?: string
 *   accommodationType?: AccommodationTypes
 *   accommodationTypeOther?: string
 *   isActual?: boolean
 * }} TravelSegmentWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{}} TravelSegmentFiltersOptions
 */

/**
 * @typedef {{
 *   where?: TravelSegmentWhereOptions,
 *   filters?: TravelSegmentFiltersOptions,
 *   order?: ModelOrder[],
 *   page?: number,
 *   perPage?: number,
 * }} TravelSegmentQueryOptions
 */

export const travelSegmentsApi = {
  TRAVEL_METHODS,
  ACCOMMODATION_TYPES,

  /**
   * @param {TravelSegmentQueryOptions} [params={}]
   * @returns {Promise<{
   *   travelSegments: TravelSegment[],
   *   totalCount: number,
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/travel-segments", {
      params,
    })
    return data
  },

  /**
   * @param {number} travelSegmentId
   * @returns {Promise<{
   *   travelSegment: TravelSegment,
   *   policy: Policy,
   * }>}
   */
  async get(travelSegmentId) {
    const { data } = await http.get(`/api/travel-segments/${travelSegmentId}`)
    return data
  },

  /**
   * @param {Partial<TravelSegment>} attributes
   * @returns {Promise<{
   *   travelSegment: TravelSegment,
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/travel-segments", attributes)
    return data
  },

  /**
   * @param {number} travelSegmentId
   * @param {Partial<TravelSegment>} attributes
   * @returns {Promise<{
   *   travelSegment: TravelSegment,
   *   policy: Policy,
   * }>}
   */
  async update(travelSegmentId, attributes) {
    const { data } = await http.patch(`/api/travel-segments/${travelSegmentId}`, attributes)
    return data
  },

  /**
   * @param {number} travelSegmentId
   * @returns {Promise<void>}
   */
  async delete(travelSegmentId) {
    const { data } = await http.delete(`/api/travel-segments/${travelSegmentId}`)
    return data
  },
}

export default travelSegmentsApi
