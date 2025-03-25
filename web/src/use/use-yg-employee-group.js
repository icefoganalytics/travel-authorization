import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import ygEmployeeGroupsApi from "@/api/yg-employee-groups-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/yg-employee-groups-api.js').YgEmployeeGroupAsShow} YgEmployeeGroupAsShow */

/**
 * Load Yukon government employee group state per id.
 *
 * @callback UseYgEmployeeGroup
 * @param {Ref<number>} ygEmployeeGroupId
 * @returns {{
 *   ygEmployeeGroup: Ref<YgEmployeeGroupAsShow> | null,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<YgEmployeeGroupAsShow>,
 *   refresh: () => Promise<YgEmployeeGroupAsShow>,
 * }}
 */

/** @type {UseYgEmployeeGroup} */
export function useYgEmployeeGroup(ygEmployeeGroupId) {
  const state = reactive({
    ygEmployeeGroup: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { ygEmployeeGroup } = await ygEmployeeGroupsApi.fetch(unref(ygEmployeeGroupId))
      state.isErrored = false
      state.ygEmployeeGroup = ygEmployeeGroup
      return ygEmployeeGroup
    } catch (error) {
      console.error("Failed to fetch Yukon government employee group:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(ygEmployeeGroupId),
    async (newYgEmployeeGroupId) => {
      if (isNil(newYgEmployeeGroupId)) return

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

export default useYgEmployeeGroup
