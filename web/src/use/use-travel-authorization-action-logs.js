import { reactive, toRefs, unref, watch } from "vue"

import travelAuthorizationActionLogsApi from "@/api/travel-authorization-action-logs-api"

/**
 * TODO: add other fields
 * @typedef {Object} TravelAuthorizationActionLog
 * @property {number} id
 */

/**
 * Fetches and manages data based on the provided options.
 *
 * @param {import('vue').Ref<{
 *   where: { [key: string]: any },
 * }>} [options={}] - The configuration options for fetching data, wrapped in a Vue ref.
 * @returns {{
 *   travelAuthorizationActionLogs: import('vue').Ref<TravelAuthorizationActionLog[]>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationActionLog[]>,
 *   refresh: () => Promise<TravelAuthorizationActionLog[]>,
 * }}
 */
export function useTravelAuthorizationActionLogs(options = {}) {
  const state = reactive({
    travelAuthorizationActionLogs: [],
    isLoading: true,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationActionLogs } = await travelAuthorizationActionLogsApi.list(
        unref(options)
      )
      state.travelAuthorizationActionLogs = travelAuthorizationActionLogs
    } catch (error) {
      state.isErrored = true
      console.error(`Failed to fetch travel authorization action logs: ${error}`, { error })
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(options),
    async () => {
      await fetch()
    },
    {
      immediate: true,
      deep: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}
