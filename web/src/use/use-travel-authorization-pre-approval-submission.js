import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelAuthorizationPreApprovalSubmissionsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/api/travel-authorization-pre-approval-submissions-api"

export { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import('@/api/travel-authorization-pre-approval-submissions-api.js').TravelAuthorizationPreApprovalSubmission} TravelAuthorizationPreApprovalSubmission */

/**
 * @callback UseTravelAuthorizationPreApprovalSubmission
 * @param {Ref<number | null | undefined>} id
 * @returns {{
 *   travelAuthorizationPreApprovalSubmission: Ref<TravelAuthorizationPreApprovalSubmission | null>,
 *   policy: Ref<Policy | null>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalSubmission>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalSubmission>,
 * }}
 */

/** @type {UseTravelAuthorizationPreApprovalSubmission} */
export function useTravelAuthorizationPreApprovalSubmission(id) {
  const state = reactive({
    travelAuthorizationPreApprovalSubmission: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalSubmission, policy } =
        await travelAuthorizationPreApprovalSubmissionsApi.get(unref(id))
      state.isErrored = false
      state.travelAuthorizationPreApprovalSubmission = travelAuthorizationPreApprovalSubmission
      state.policy = policy
      return travelAuthorizationPreApprovalSubmission
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval submission:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelAuthorizationPreApprovalSubmission
