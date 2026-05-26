import { reactive, toRefs, unref, watch, ref } from "vue"

import travelAuthorizationPreApprovalsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
  type TravelAuthorizationPreApprovalAsIndex,
  type TravelAuthorizationPreApprovalWhereOptions,
  type TravelAuthorizationPreApprovalFiltersOptions,
  type TravelAuthorizationPreApprovalsQueryOptions,
  TravelAuthorizationPreApprovalStatuses,
} from "@/api/travel-authorization-pre-approvals-api"

export {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
  TravelAuthorizationPreApprovalStatuses,
  type TravelAuthorizationPreApprovalAsIndex,
  type TravelAuthorizationPreApprovalWhereOptions,
  type TravelAuthorizationPreApprovalFiltersOptions,
  type TravelAuthorizationPreApprovalsQueryOptions,
}

export function useTravelAuthorizationPreApprovals(
  options = ref<TravelAuthorizationPreApprovalsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelAuthorizationPreApprovals: TravelAuthorizationPreApprovalAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizationPreApprovals: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationPreApprovalAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovals, totalCount } =
        await travelAuthorizationPreApprovalsApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovals = travelAuthorizationPreApprovals
      state.totalCount = totalCount
      return travelAuthorizationPreApprovals
    } catch (error) {
      console.error(`Failed to fetch travel authorization pre-approvals: ${error}`, { error })
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
