import { reactive, toRefs, unref, watch, ref } from "vue"

import travelAuthorizationPreApprovalSubmissionsApi, {
  type TravelAuthorizationPreApprovalSubmissionAsIndex,
  type TravelAuthorizationPreApprovalSubmissionWhereOptions,
  type TravelAuthorizationPreApprovalSubmissionFiltersOptions,
  type TravelAuthorizationPreApprovalSubmissionsQueryOptions,
  TravelAuthorizationPreApprovalSubmissionStatuses,
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/api/travel-authorization-pre-approval-submissions-api"

export {
  type TravelAuthorizationPreApprovalSubmissionAsIndex,
  type TravelAuthorizationPreApprovalSubmissionWhereOptions,
  type TravelAuthorizationPreApprovalSubmissionFiltersOptions,
  type TravelAuthorizationPreApprovalSubmissionsQueryOptions,
  TravelAuthorizationPreApprovalSubmissionStatuses,
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
}

export function useTravelAuthorizationPreApprovalSubmissions(
  options = ref<TravelAuthorizationPreApprovalSubmissionsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelAuthorizationPreApprovalSubmissions: TravelAuthorizationPreApprovalSubmissionAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizationPreApprovalSubmissions: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationPreApprovalSubmissionAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalSubmissions, totalCount } =
        await travelAuthorizationPreApprovalSubmissionsApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovalSubmissions = travelAuthorizationPreApprovalSubmissions
      state.totalCount = totalCount
      return travelAuthorizationPreApprovalSubmissions
    } catch (error) {
      console.error(`Failed to fetch travel authorization pre-approval submissions: ${error}`, {
        error,
      })
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
