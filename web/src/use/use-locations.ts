import { type Ref, reactive, toRefs, unref, watch, ref } from "vue"

import locationsApi, {
  type LocationAsIndex,
  type LocationWhereOptions,
  type LocationFiltersOptions,
  type LocationsQueryOptions,
} from "@/api/locations-api"

export {
  type LocationAsIndex,
  type LocationWhereOptions,
  type LocationFiltersOptions,
  type LocationsQueryOptions,
}

export function useLocations(
  options = ref<LocationsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  locations: Ref<LocationAsIndex[]>
  totalCount: Ref<number>
  isLoading: Ref<boolean>
  isErrored: Ref<boolean>
  fetch: () => Promise<LocationAsIndex[]>
  refresh: () => Promise<LocationAsIndex[]>
} {
  const state = reactive<{
    locations: LocationAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    locations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<LocationAsIndex[]> {
    state.isLoading = true
    try {
      const { locations, totalCount } = await locationsApi.list(unref(options))
      state.isErrored = false
      state.locations = locations
      state.totalCount = totalCount
      return locations
    } catch (error) {
      console.error(`Failed to fetch locations: ${error}`, { error })
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

export default useLocations
