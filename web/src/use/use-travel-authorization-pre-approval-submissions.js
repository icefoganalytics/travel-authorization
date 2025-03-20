import { reactive, toRefs, ref, unref, watch } from "vue"

import travelAuthorizationPreApprovalSubmissionsApi from "@/api/travel-authorization-pre-approval-submissions-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorization-pre-approval-submissions-api.js').TravelAuthorizationPreApprovalSubmission} TravelAuthorizationPreApprovalSubmission */
/** @typedef {import('@/api/travel-authorization-pre-approval-submissions-api.js').TravelAuthorizationPreApprovalSubmissionsQueryOptions} TravelAuthorizationPreApprovalSubmissionsQueryOptions */

/**
 * Provides reactive state management for travel authorization pre-approval submissions with API integration.
 *
 * @param {TravelAuthorizationPreApprovalSubmissionsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travel authorization pre-approval submissions.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelAuthorizationPreApprovalSubmissions: Ref<TravelAuthorizationPreApprovalSubmission[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalSubmission[]>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalSubmission[]>
 * }}
 */
export function useTravelAuthorizationPreApprovalSubmissions(
  options = ref({}),
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    travelAuthorizationPreApprovalSubmissions: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalSubmissions, totalCount } =
        await travelAuthorizationPreApprovalSubmissionsApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovalSubmissions = travelAuthorizationPreApprovalSubmissions
      state.totalCount = totalCount
      return travelAuthorizationPreApprovalSubmissions
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval submissions:", error)
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

export default useTravelAuthorizationPreApprovalSubmissions
