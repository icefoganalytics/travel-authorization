import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelDeskRentalCarsApi, {
  type TravelDeskRentalCarAsShow,
  type TravelDeskRentalCarPolicy,
  LOCATION_TYPES,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
} from "@/api/travel-desk-rental-cars-api"

export {
  type TravelDeskRentalCarAsShow,
  LOCATION_TYPES,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
}

export function useTravelDeskRentalCar(id: Ref<number | null | undefined>) {
  const state = reactive<{
    travelDeskRentalCar: TravelDeskRentalCarAsShow | null
    policy: TravelDeskRentalCarPolicy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskRentalCar: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskRentalCarAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { travelDeskRentalCar, policy } = await travelDeskRentalCarsApi.get(staticId)
      state.isErrored = false
      state.travelDeskRentalCar = travelDeskRentalCar
      state.policy = policy
      return travelDeskRentalCar
    } catch (error) {
      console.error(`Failed to fetch travelDeskRentalCar: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<TravelDeskRentalCarAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.travelDeskRentalCar)) {
      throw new Error("No travelDeskRentalCar to save")
    }

    state.isLoading = true
    try {
      const { travelDeskRentalCar, policy } = await travelDeskRentalCarsApi.update(
        staticId,
        state.travelDeskRentalCar
      )
      state.isErrored = false
      state.travelDeskRentalCar = travelDeskRentalCar
      state.policy = policy
      return travelDeskRentalCar
    } catch (error) {
      console.error(`Failed to save travelDeskRentalCar: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
  }
}

export default useTravelDeskRentalCar
