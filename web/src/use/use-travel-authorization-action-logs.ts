import { reactive, toRefs, unref, watch, ref } from "vue"

import travelAuthorizationActionLogsApi, {
  type TravelAuthorizationActionLogAsIndex,
  type TravelAuthorizationActionLogWhereOptions,
  type TravelAuthorizationActionLogsQueryOptions,
} from "@/api/travel-authorization-action-logs-api"

export {
  type TravelAuthorizationActionLogAsIndex,
  type TravelAuthorizationActionLogWhereOptions,
  type TravelAuthorizationActionLogsQueryOptions,
}

export function useTravelAuthorizationActionLogs(
  options = ref<TravelAuthorizationActionLogsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelAuthorizationActionLogs: TravelAuthorizationActionLogAsIndex[]
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorizationActionLogs: [],
    isLoading: true,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationActionLogAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAuthorizationActionLogs } = await travelAuthorizationActionLogsApi.list(
        unref(options)
      )
      state.travelAuthorizationActionLogs = travelAuthorizationActionLogs
      return travelAuthorizationActionLogs
    } catch (error) {
      console.error(`Failed to fetch travel authorization action logs: ${error}`, { error })
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

export default useTravelAuthorizationActionLogs
