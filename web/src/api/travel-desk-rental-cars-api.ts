import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarsLocationTypes {
  AIRPORT = "Airport",
  HOTEL = "Hotel",
  DOWNTOWN = "Downtown",
  OTHER = "Other",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarsLocationTypes` */
export const LOCATION_TYPES = Object.freeze({
  AIRPORT: "Airport",
  HOTEL: "Hotel",
  DOWNTOWN: "Downtown",
  OTHER: "Other",
})

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarsStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarsStatuses` */
export const TRAVEL_DESK_RENTAL_CAR_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarsVehicleTypes {
  ECONOMY = "Economy",
  COMPACT = "Compact",
  INTERMEDIATE = "Intermediate",
  STANDARD = "Standard",
  FULL_SIZE = "Full-Size",
  INTERMEDIATE_SUV = "Intermediate SUV",
  LUXURY = "Luxury",
  MINIVAN = "Minivan",
  STANDARD_SUV = "Standard SUV",
  FULL_SIZE_SUV = "Full-Size SUV",
  PICKUP_TRUCK = "Pickup Truck",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarsVehicleTypes` */
export const VEHICLE_TYPES = Object.freeze({
  ECONOMY: "Economy",
  COMPACT: "Compact",
  INTERMEDIATE: "Intermediate",
  STANDARD: "Standard",
  FULL_SIZE: "Full-Size",
  INTERMEDIATE_SUV: "Intermediate SUV",
  LUXURY: "Luxury",
  MINIVAN: "Minivan",
  STANDARD_SUV: "Standard SUV",
  FULL_SIZE_SUV: "Full-Size SUV",
  PICKUP_TRUCK: "Pickup Truck",
})

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export type TravelDeskRentalCar = {
  id: number
  travelRequestId: number
  pickUpCity: string
  pickUpLocation: string
  pickUpLocationOther: string | null
  dropOffCity: string | null
  dropOffLocation: string | null
  dropOffLocationOther: string | null
  sameDropOffLocation: boolean
  matchFlightTimes: boolean
  vehicleTypeChangeIndicator: string | null
  vehicleType: string
  vehicleChangeRationale: string | null
  pickUpDate: string
  dropOffDate: string
  additionalNotes: string | null
  status: string
  reservedVehicleInfo: string | null
  booking: string | null
  createdAt: string
  updatedAt: string
}

export type TravelDeskRentalCarAsIndex = TravelDeskRentalCar

export type TravelDeskRentalCarWhereOptions = WhereOptions<
  TravelDeskRentalCar,
  | "id"
  | "travelRequestId"
  | "pickUpCity"
  | "pickUpLocation"
  | "dropOffCity"
  | "dropOffLocation"
  | "sameDropOffLocation"
  | "matchFlightTimes"
  | "vehicleType"
  | "pickUpDate"
  | "dropOffDate"
  | "status"
  | "booking"
>

/** must match model scopes */
export type TravelDeskRentalCarFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskRentalCarsQueryOptions = QueryOptions<
  TravelDeskRentalCarWhereOptions,
  TravelDeskRentalCarFiltersOptions
>

export const travelDeskRentalCarsApi = {
  async list(params: TravelDeskRentalCarsQueryOptions = {}): Promise<{
    travelDeskRentalCars: TravelDeskRentalCarAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-rental-cars", {
      params,
    })
    return data
  },

  async get(
    travelDeskRentalCarId: number,
    params: TravelDeskRentalCarsQueryOptions = {}
  ): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`, {
      params,
    })
    return data
  },

  async create(attributes: Partial<TravelDeskRentalCar>): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
    policy: Policy
  }> {
    const { data } = await http.post("/api/travel-desk-rental-cars", attributes)
    return data
  },

  async update(
    travelDeskRentalCarId: number,
    attributes: Partial<TravelDeskRentalCar>
  ): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
    policy: Policy
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-rental-cars/${travelDeskRentalCarId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskRentalCarId: number): Promise<void> {
    await http.delete(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`)
  },
}

export default travelDeskRentalCarsApi
