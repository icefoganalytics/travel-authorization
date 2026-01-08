import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { type Policy } from "@/api/base-api"
import accountsReceivableInvoicesApi, {
  type AccountsReceivableInvoiceAsShow,
} from "@/api/trav-com/accounts-receivable-invoices-api"

export { type AccountsReceivableInvoiceAsShow }

export function useAccountsReceivableInvoice(id: Ref<number | null | undefined>) {
  const state = reactive<{
    accountsReceivableInvoice: AccountsReceivableInvoiceAsShow | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    accountsReceivableInvoice: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<AccountsReceivableInvoiceAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { accountsReceivableInvoice, policy } =
        await accountsReceivableInvoicesApi.get(staticId)
      state.isErrored = false
      state.accountsReceivableInvoice = accountsReceivableInvoice
      state.policy = policy
      return accountsReceivableInvoice
    } catch (error) {
      console.error(`Failed to fetch accounts receivable invoice: ${error}`, { error })
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
  }
}

export default useAccountsReceivableInvoice
