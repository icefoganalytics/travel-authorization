import { type Ref, ref, reactive, toRefs, unref, watch } from "vue"

import accountsReceivableInvoicesApi, {
  type AccountsReceivableInvoiceAsIndex,
  type AccountsReceivableInvoiceQueryOptions,
} from "@/api/accounts-receivable-invoices-api"

export { type AccountsReceivableInvoiceAsIndex, type AccountsReceivableInvoiceQueryOptions }

export function useAccountsReceivableInvoices(
  options: Ref<AccountsReceivableInvoiceQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    accountsReceivableInvoices: AccountsReceivableInvoiceAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
    isInitialized: boolean
  }>({
    accountsReceivableInvoices: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
    isInitialized: false,
  })

  async function fetch(): Promise<AccountsReceivableInvoiceAsIndex[]> {
    state.isLoading = true
    try {
      const { accountsReceivableInvoices, totalCount } = await accountsReceivableInvoicesApi.list(
        unref(options)
      )
      state.isErrored = false
      state.accountsReceivableInvoices = accountsReceivableInvoices
      state.totalCount = totalCount
      return accountsReceivableInvoices
    } catch (error) {
      console.error(`Failed to fetch accounts receivable invoices: ${error}`, { error })
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

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useAccountsReceivableInvoices
