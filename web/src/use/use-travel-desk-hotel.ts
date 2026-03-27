import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelDeskHotelsApi, {
  TravelDeskHotelStatuses,
  type TravelDeskHotelAsShow,
  type TravelDeskHotelPolicy,
} from "@/api/travel-desk-hotels-api"

export { TravelDeskHotelStatuses, type TravelDeskHotelAsShow, type TravelDeskHotelPolicy }

export function useTravelDeskHotel(travelDeskHotelId: Ref<number | null | undefined>) {
  const state = reactive<{
    travelDeskHotel: TravelDeskHotelAsShow | null
    policy: TravelDeskHotelPolicy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskHotel: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskHotelAsShow> {
    const staticId = unref(travelDeskHotelId)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { travelDeskHotel, policy } = await travelDeskHotelsApi.get(staticId)
      state.isErrored = false
      state.travelDeskHotel = travelDeskHotel
      state.policy = policy
      return travelDeskHotel
    } catch (error) {
      console.error(`Failed to fetch travel desk hotel: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<TravelDeskHotelAsShow> {
    const staticId = unref(travelDeskHotelId)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.travelDeskHotel)) {
      throw new Error("No travel desk hotel to save")
    }

    state.isLoading = true
    try {
      const { travelDeskHotel, policy } = await travelDeskHotelsApi.update(
        staticId,
        state.travelDeskHotel
      )
      state.isErrored = false
      state.travelDeskHotel = travelDeskHotel
      state.policy = policy
      return travelDeskHotel
    } catch (error) {
      console.error(`Failed to save travel desk hotel: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelDeskHotelId),
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

export default useTravelDeskHotel
