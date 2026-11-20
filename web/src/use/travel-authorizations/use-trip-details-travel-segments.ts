import { computed, type Ref } from "vue"

import useSnack from "@/use/use-snack"
import useTravelSegments, { type TravelSegmentsQueryOptions } from "@/use/use-travel-segments"

export function useTripDetailsTravelSegments(
  travelAuthorizationId: Ref<number>,
  { isActual }: { isActual: boolean }
) {
  function phaseQuery(isActual: boolean) {
    return computed<TravelSegmentsQueryOptions>(() => ({
      where: {
        travelAuthorizationId: travelAuthorizationId.value,
        isActual,
      },
      order: [
        ["segmentNumber", "ASC"],
        ["id", "ASC"],
      ],
      perPage: -1,
    }))
  }

  const requestedPhase = useTravelSegments(phaseQuery(isActual))
  const needsEstimateSeed = computed(
    () => isActual && requestedPhase.isInitialized.value && requestedPhase.totalCount.value === 0
  )
  const estimates = useTravelSegments(phaseQuery(false), {
    skipWatchIf: () => !needsEstimateSeed.value,
  })
  const source = computed(() => (needsEstimateSeed.value ? estimates : requestedPhase))
  const snack = useSnack()

  async function retry() {
    try {
      await source.value.refresh()
    } catch (error) {
      snack.error(`Failed to load itinerary: ${error}`)
    }
  }

  return {
    travelSegments: computed(() => source.value.travelSegments.value),
    isInitialized: computed(() => source.value.isInitialized.value),
    isErrored: computed(() => source.value.isErrored.value),
    retry,
  }
}

export default useTripDetailsTravelSegments
