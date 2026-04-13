import { type Ref, reactive, toRefs, unref, watch, ref } from "vue"

import travelAuthorizationPreApprovalProfilesApi, {
  type TravelAuthorizationPreApprovalProfileAsIndex,
  type TravelAuthorizationPreApprovalProfileWhereOptions,
  type TravelAuthorizationPreApprovalProfileFiltersOptions,
  type TravelAuthorizationPreApprovalProfilesQueryOptions,
} from "@/api/travel-authorization-pre-approval-profiles-api"

export {
  type TravelAuthorizationPreApprovalProfileAsIndex,
  type TravelAuthorizationPreApprovalProfileWhereOptions,
  type TravelAuthorizationPreApprovalProfileFiltersOptions,
  type TravelAuthorizationPreApprovalProfilesQueryOptions,
}

export function useTravelAuthorizationPreApprovalProfiles(
  options = ref<TravelAuthorizationPreApprovalProfilesQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  travelAuthorizationPreApprovalProfiles: Ref<TravelAuthorizationPreApprovalProfileAsIndex[]>
  totalCount: Ref<number>
  isLoading: Ref<boolean>
  isErrored: Ref<boolean>
  fetch: () => Promise<TravelAuthorizationPreApprovalProfileAsIndex[]>
  refresh: () => Promise<TravelAuthorizationPreApprovalProfileAsIndex[]>
} {
  const state = reactive<{
    travelAuthorizationPreApprovalProfiles: TravelAuthorizationPreApprovalProfileAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizationPreApprovalProfiles: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationPreApprovalProfileAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalProfiles, totalCount } =
        await travelAuthorizationPreApprovalProfilesApi.list(unref(options))
      state.isErrored = false
      state.travelAuthorizationPreApprovalProfiles = travelAuthorizationPreApprovalProfiles
      state.totalCount = totalCount
      return travelAuthorizationPreApprovalProfiles
    } catch (error) {
      console.error(`Failed to fetch travel authorization pre-approval profiles: ${error}`, {
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

export default useTravelAuthorizationPreApprovalProfiles
