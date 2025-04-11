import { ref, reactive, toRefs, unref, watch } from "vue"

import expensesApi, { TYPES, EXPENSE_TYPES } from "@/api/expenses-api"

export { TYPES, EXPENSE_TYPES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/expenses-api.js').Expense} Expense */
/** @typedef {import('@/api/expenses-api.js').ExpenseQueryOptions} ExpenseQueryOptions */

/**
 * Fetches and manages expenses data based on the provided options.
 *
 * @param {ExpenseQueryOptions} [options={}] - The configuration options for fetching expenses.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   expenses: Ref<Expense[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Expense[]>,
 *   refresh: () => Promise<Expense[]>
 * }}
 */
export function useExpenses(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    expenses: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { expenses, totalCount } = await expensesApi.list(unref(options))
      state.isErrored = false
      state.expenses = expenses
      state.totalCount = totalCount
      return expenses
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
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
    TYPES,
    EXPENSE_TYPES,
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useExpenses
