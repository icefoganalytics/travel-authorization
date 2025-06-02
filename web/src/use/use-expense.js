import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import expensesApi from "@/api/expenses-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/expenses-api.js').Expense} Expense */

/**
 * @callback UseExpense
 * @param {Ref<number>} id
 * @returns {{
 *   expense: Ref<Expense | null | undefined>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Expense>,
 *   refresh: () => Promise<Expense>,
 *   save: () => Promise<Expense>,
 * }}
 */

/** @type {UseExpense} */
export function useExpense(id) {
  const state = reactive({
    expense: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { expense } = await expensesApi.get(staticId)
      state.isErrored = false
      state.expense = expense
      return expense
    } catch (error) {
      console.error("Failed to fetch expense:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save() {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.expense)) {
      throw new Error("No expense to save")
    }

    state.isLoading = true
    try {
      const { expense } = await expensesApi.update(staticId, state.expense)
      state.isErrored = false
      state.expense = expense
      return expense
    } catch (error) {
      console.error("Failed to save expense:", error)
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
    save,
  }
}

export default useExpense
