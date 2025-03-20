import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelAuthorizationPreApprovalsApi from "@/api/travel-authorization-pre-approvals-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import('@/api/travel-authorization-pre-approvals-api.js').TravelAuthorizationPreApprovalAsShow} TravelAuthorizationPreApprovalAsShow */

/**
 * @callback UseTravelAuthorizationPreApproval
 * @param {Ref<number | null | undefined>} id
 * @returns {{
 *   travelAuthorizationPreApproval: Ref<TravelAuthorizationPreApprovalAsShow | null>,
 *   policy: Ref<Policy | null>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalAsShow>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalAsShow>,
 * }}
 */

/** @type {UseTravelAuthorizationPreApproval} */
export function useTravelAuthorizationPreApproval(id) {
  const state = reactive({
    travelAuthorizationPreApproval: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApproval, policy } =
        await travelAuthorizationPreApprovalsApi.get(unref(id))
      state.isErrored = false
      state.travelAuthorizationPreApproval = travelAuthorizationPreApproval
      state.policy = policy
      return travelAuthorizationPreApproval
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval:", error)
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

export default useTravelAuthorizationPreApproval
