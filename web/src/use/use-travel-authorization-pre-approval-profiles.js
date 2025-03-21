import { reactive, toRefs, ref, unref, watch } from "vue"

import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorization-pre-approval-profiles-api.js').TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */
/** @typedef {import('@/api/travel-authorization-pre-approval-profiles-api.js').TravelAuthorizationPreApprovalProfilesQueryOptions} TravelAuthorizationPreApprovalProfilesQueryOptions */

/**
 * Provides reactive state management for travel authorization pre-approval profiles with API integration.
 *
 * @param {TravelAuthorizationPreApprovalProfilesQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travel authorization pre-approval profiles.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelAuthorizationPreApprovalProfiles: Ref<TravelAuthorizationPreApprovalProfile[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalProfile[]>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalProfile[]>
 * }}
 */
export function useTravelAuthorizationPreApprovalProfiles(
  options = ref({}),
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    travelAuthorizationPreApprovalProfiles: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalProfiles, totalCount } =
        await travelAuthorizationPreApprovalProfilesApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovalProfiles = travelAuthorizationPreApprovalProfiles
      state.totalCount = totalCount
      return travelAuthorizationPreApprovalProfiles
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval profiles:", error)
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

export default useTravelAuthorizationPreApprovalProfiles
