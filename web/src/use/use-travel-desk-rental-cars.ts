import { reactive, toRefs, unref, watch, ref } from "vue"

import travelDeskRentalCarsApi, {
  type TravelDeskRentalCarAsIndex,
  type TravelDeskRentalCarWhereOptions,
  type TravelDeskRentalCarFiltersOptions,
  type TravelDeskRentalCarsQueryOptions,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
  LOCATION_TYPES,
  TRAVEL_DESK_RENTAL_CAR_STATUSES,
  VEHICLE_TYPES,
} from "@/api/travel-desk-rental-cars-api"

export {
  type TravelDeskRentalCarAsIndex,
  type TravelDeskRentalCarWhereOptions,
  type TravelDeskRentalCarFiltersOptions,
  type TravelDeskRentalCarsQueryOptions,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
  // Exporting deprecated constants for backward compatibility
  LOCATION_TYPES,
  TRAVEL_DESK_RENTAL_CAR_STATUSES,
  VEHICLE_TYPES,
}

export function useTravelDeskRentalCars(
  options = ref<TravelDeskRentalCarsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelDeskRentalCars: TravelDeskRentalCarAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskRentalCars: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskRentalCarAsIndex[]> {
    state.isLoading = true
    try {
      const { travelDeskRentalCars, totalCount } = await travelDeskRentalCarsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.travelDeskRentalCars = travelDeskRentalCars
      state.totalCount = totalCount
      return travelDeskRentalCars
    } catch (error) {
      console.error(`Failed to fetch travelDeskRentalCars: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip]) => {
      if (skip) return

      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskRentalCars
