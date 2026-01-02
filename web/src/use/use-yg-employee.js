import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import ygEmployeesApi from "@/api/yg-employees-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/yg-employees-api.js').YgEmployeeAsShow} YgEmployeeAsShow */

/**
 * This loads Yukon government employee state per id.
 *
 * @callback UseYgEmployee
 * @param {Ref<number>} ygEmployeeId
 * @returns {{
 *   ygEmployee: Ref<YgEmployeeAsShow> | null,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<YgEmployeeAsShow>,
 *   refresh: () => Promise<YgEmployeeAsShow>,
 * }}
 */

/** @type {UseYgEmployee} */
export function useYgEmployee(ygEmployeeId) {
  const state = reactive({
    ygEmployee: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { ygEmployee } = await ygEmployeesApi.get(unref(ygEmployeeId))
      state.isErrored = false
      state.ygEmployee = ygEmployee
      return ygEmployee
    } catch (error) {
      console.error("Failed to fetch Yukon government employee:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(ygEmployeeId),
    async (newYgEmployeeId) => {
      if (isNil(newYgEmployeeId)) return

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

export default useYgEmployee
