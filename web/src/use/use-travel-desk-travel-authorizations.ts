import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue"

import travelDeskTravelAuthorizationsApi, {
  type TravelDeskTravelAuthorization,
  type TravelDeskTravelAuthorizationsQueryOptions,
} from "@/api/travel-desk-travel-authorizations-api"

export function useTravelDeskTravelAuthorizations(
  options: MaybeRefOrGetter<TravelDeskTravelAuthorizationsQueryOptions>
) {
  const travelAuthorizations = ref<TravelDeskTravelAuthorization[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const isErrored = ref(false)
  let requestNumber = 0

  async function fetch() {
    const currentRequestNumber = ++requestNumber
    isLoading.value = true
    isErrored.value = false

    try {
      const response = await travelDeskTravelAuthorizationsApi.list(toValue(options))
      if (currentRequestNumber !== requestNumber) return

      travelAuthorizations.value = response.travelAuthorizations
      totalCount.value = response.totalCount
    } catch (error) {
      if (currentRequestNumber !== requestNumber) return

      isErrored.value = true
      throw error
    } finally {
      if (currentRequestNumber === requestNumber) isLoading.value = false
    }
  }

  watch(
    () => toValue(options),
    () => void fetch().catch((error) => console.error(error)),
    { deep: true, immediate: true }
  )

  return {
    travelAuthorizations: computed(() => travelAuthorizations.value),
    totalCount: computed(() => totalCount.value),
    isLoading: computed(() => isLoading.value),
    isErrored: computed(() => isErrored.value),
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskTravelAuthorizations
