import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import('@/api/travel-authorization-pre-approval-profiles-api.js').TravelAuthorizationPreApprovalProfileAsShow} TravelAuthorizationPreApprovalProfileAsShow */

/**
 * @callback UseTravelAuthorizationPreApprovalProfile
 * @param {Ref<number>} id
 * @returns {{
 *   travelAuthorizationPreApprovalProfile: Ref<TravelAuthorizationPreApprovalProfileAsShow | null | undefined>,
 *   policy: Ref<Policy | null>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalProfileAsShow>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalProfileAsShow>,
 * }}
 */

/** @type {UseTravelAuthorizationPreApprovalProfile} */
export function useTravelAuthorizationPreApprovalProfile(id) {
  const state = reactive({
    travelAuthorizationPreApprovalProfile: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalProfile, policy } =
        await travelAuthorizationPreApprovalProfilesApi.get(unref(id))
      state.isErrored = false
      state.travelAuthorizationPreApprovalProfile = travelAuthorizationPreApprovalProfile
      state.policy = policy
      return travelAuthorizationPreApprovalProfile
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval profile:", error)
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

export default useTravelAuthorizationPreApprovalProfile
