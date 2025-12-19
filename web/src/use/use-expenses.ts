import { type Ref, ref, reactive, toRefs, unref, watch } from "vue"

import expensesApi, {
  type ExpenseAsIndex,
  type ExpenseWhereOptions,
  type ExpenseFiltersOptions,
  type ExpenseQueryOptions,
  TYPES,
  EXPENSE_TYPES,
  ExpenseTypes,
  ExpenseExpenseTypes,
} from "@/api/expenses-api"

export {
  type ExpenseAsIndex,
  type ExpenseWhereOptions,
  type ExpenseFiltersOptions,
  type ExpenseQueryOptions,
  TYPES,
  EXPENSE_TYPES,
  ExpenseTypes,
  ExpenseExpenseTypes,
}

/**
 * Fetches and manages expenses data based on the provided options.
 */
export function useExpenses(
  options: Ref<ExpenseQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    expenses: ExpenseAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
    isInitialized: boolean
  }>({
    expenses: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
    isInitialized: false,
  })

  async function fetch(): Promise<ExpenseAsIndex[]> {
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
      state.isInitialized = true
    },
    { deep: true, immediate: true }
  )

  async function isReady(): Promise<boolean> {
    return new Promise((resolve) => {
      if (state.isInitialized) {
        resolve(true)
      } else {
        const interval = setInterval(() => {
          if (state.isErrored) {
            clearInterval(interval)
            return resolve(false)
          } else if (state.isInitialized && !state.isLoading) {
            clearInterval(interval)
            return resolve(true)
          }
        }, 10)
      }
    })
  }

  return {
    TYPES,
    EXPENSE_TYPES,
    ...toRefs(state),
    fetch,
    refresh: fetch,
    isReady,
  }
}

export default useExpenses
