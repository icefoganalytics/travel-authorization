import { type Ref, ref, reactive, toRefs, unref, watch } from "vue"

import travelAuthorizationsApi, {
  type TravelAuthorizationAsIndex,
  type TravelAuthorizationWhereOptions,
  type TravelAuthorizationFiltersOptions,
  type TravelAuthorizationsQueryOptions,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
  TravelAuthorizationWizardStepNames,
  STATUSES,
  TRIP_TYPES,
  TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,
} from "@/api/travel-authorizations-api"

export {
  type TravelAuthorizationAsIndex,
  type TravelAuthorizationWhereOptions,
  type TravelAuthorizationFiltersOptions,
  type TravelAuthorizationsQueryOptions,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
  TravelAuthorizationWizardStepNames,
  STATUSES,
  TRIP_TYPES,
  TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,
}

/**
 * Fetches travel authorizations based on the provided query options.
 */
export function useTravelAuthorizations(
  options: Ref<TravelAuthorizationsQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelAuthorizations: TravelAuthorizationAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAuthorizations, totalCount } = await travelAuthorizationsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.travelAuthorizations = travelAuthorizations
      state.totalCount = totalCount
      return travelAuthorizations
    } catch (error) {
      console.error(`Failed to fetch travel authorizations: ${error}`, { error })
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
    TravelAuthorizationStatuses,
    TravelAuthorizationTripTypes,
    TravelAuthorizationWizardStepNames,
    STATUSES,
    TRIP_TYPES,
    TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelAuthorizations
