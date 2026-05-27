import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { type Policy } from "@/api/base-api"
import travelAuthorizationPreApprovalsApi, {
  type TravelAuthorizationPreApprovalAsShow,
} from "@/api/travel-authorization-pre-approvals-api"

export function useTravelAuthorizationPreApproval(id: Ref<number | null | undefined>) {
  const state = reactive<{
    travelAuthorizationPreApproval: TravelAuthorizationPreApprovalAsShow | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizationPreApproval: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationPreApprovalAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorizationPreApproval, policy } =
        await travelAuthorizationPreApprovalsApi.get(staticId)
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
