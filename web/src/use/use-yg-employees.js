import { reactive, toRefs, ref, unref, watch } from "vue"

import ygEmployeesApi from "@/api/yg-employees-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/yg-employees-api.js').YgEmployeeAsIndex} YgEmployeeAsIndex */
/** @typedef {import('@/api/yg-employees-api.js').YgEmployeesQueryOptions} YgEmployeesQueryOptions */

/**
 * Provides reactive state management for Yukon government employees with API integration.
 *
 * @param {YgEmployeesQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   ygEmployees: Ref<YgEmployeeAsIndex[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<YgEmployeeAsIndex[]>,
 *   refresh: () => Promise<YgEmployeeAsIndex[]>
 * }}
 */
export function useYgEmployees(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    ygEmployees: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { ygEmployees, totalCount } = await ygEmployeesApi.list(unref(options))
      state.isErrored = false
      state.ygEmployees = ygEmployees
      state.totalCount = totalCount
      return ygEmployees
    } catch (error) {
      console.error("Failed to fetch Yukon government employees:", error)
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

export default useYgEmployees
