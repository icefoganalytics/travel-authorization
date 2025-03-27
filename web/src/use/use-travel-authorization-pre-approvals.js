import { reactive, toRefs, ref, unref, watch } from "vue"

import travelAuthorizationPreApprovalsApi from "@/api/travel-authorization-pre-approvals-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorization-pre-approvals-api.js').TravelAuthorizationPreApproval} TravelAuthorizationPreApproval */
/** @typedef {import('@/api/travel-authorization-pre-approvals-api.js').TravelAuthorizationPreApprovalsQueryOptions} TravelAuthorizationPreApprovalsQueryOptions */

/**
 * Provides reactive state management for travel authorization pre-approvals with API integration.
 *
 * @param {TravelAuthorizationPreApprovalsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travel authorization pre-approvals.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelAuthorizationPreApprovals: Ref<TravelAuthorizationPreApproval[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApproval[]>,
 *   refresh: () => Promise<TravelAuthorizationPreApproval[]>
 * }}
 */
export function useTravelAuthorizationPreApprovals(
  options = ref({}),
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    travelAuthorizationPreApprovals: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovals, totalCount } =
        await travelAuthorizationPreApprovalsApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovals = travelAuthorizationPreApprovals
      state.totalCount = totalCount
      return travelAuthorizationPreApprovals
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approvals:", error)
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

export default useTravelAuthorizationPreApprovals
