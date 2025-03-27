import { reactive, toRefs, ref, unref, watch } from "vue"

import ygEmployeeGroupsApi from "@/api/yg-employee-groups-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/yg-employee-groups-api.js').YgEmployeeGroupAsIndex} YgEmployeeGroupAsIndex */
/** @typedef {import('@/api/yg-employee-groups-api.js').YgEmployeeGroupsQueryOptions} YgEmployeeGroupsQueryOptions */

/**
 * Reactive state management for Yukon government employee groups.
 *
 * @param {YgEmployeeGroupsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   ygEmployeeGroups: Ref<YgEmployeeGroupAsIndex[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<YgEmployeeGroupAsIndex[]>,
 *   refresh: () => Promise<YgEmployeeGroupAsIndex[]>
 * }}
 */
export function useYgEmployeeGroups(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    ygEmployeeGroups: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { ygEmployeeGroups, totalCount } = await ygEmployeeGroupsApi.list(unref(options))
      state.isErrored = false
      state.ygEmployeeGroups = ygEmployeeGroups
      state.totalCount = totalCount
      return ygEmployeeGroups
    } catch (error) {
      console.error("Failed to fetch Yukon government employee groups:", error)
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

export default useYgEmployeeGroups
