import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { Policy } from "@/api/base-api"
import expensesApi, { type Expense } from "@/api/expenses-api"

export { type Expense }

export function useExpense(id: Ref<number | null | undefined>) {
  const state = reactive<{
    expense: Expense | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    expense: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Expense> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { expense, policy } = await expensesApi.get(staticId)
      state.isErrored = false
      state.expense = expense
      state.policy = policy
      return expense
    } catch (error) {
      console.error(`Failed to fetch expense: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<Expense> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    if (isNil(state.expense)) {
      throw new Error("No expense to save")
    }

    state.isLoading = true
    try {
      const { expense, policy } = await expensesApi.update(staticId, state.expense)
      state.isErrored = false
      state.expense = expense
      state.policy = policy
      return expense
    } catch (error) {
      console.error(`Failed to save expense: ${error}`, { error })
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
