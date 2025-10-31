import { reactive, toRefs, ref, unref, watch } from "vue"

import ygEmployeeGroupsApi, {
  type YgEmployeeGroupAsIndex,
  type YgEmployeeGroupFiltersOptions,
  type YgEmployeeGroupsQueryOptions,
  type YgEmployeeGroupWhereOptions,
} from "@/api/yg-employee-groups-api"

export {
  type YgEmployeeGroupAsIndex,
  type YgEmployeeGroupFiltersOptions,
  type YgEmployeeGroupsQueryOptions,
  type YgEmployeeGroupWhereOptions,
}

/**
 * Reactive state management for Yukon government employee groups.
 */
export function useYgEmployeeGroups(
  queryOptions = ref<YgEmployeeGroupsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    ygEmployeeGroups: YgEmployeeGroupAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    ygEmployeeGroups: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { ygEmployeeGroups, totalCount } = await ygEmployeeGroupsApi.list(unref(queryOptions))
      state.isErrored = false
      state.ygEmployeeGroups = ygEmployeeGroups
      state.totalCount = totalCount
      return ygEmployeeGroups
    } catch (error) {
      console.error(`Failed to fetch Yukon government employee groups: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(queryOptions)],
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

export default useYgEmployeeGroups
