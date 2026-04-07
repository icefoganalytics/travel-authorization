<template>
  <v-btn
    :loading="isLoading"
    v-bind="$attrs"
    @click="syncWithExternalDatabase"
  >
    Sync from TravCom ({{ totalCount }})
    <v-tooltip left>
      <template #activator="{ on, attrs }">
        <v-icon
          right
          small
          v-bind="attrs"
          v-on="on"
          @click.stop
          >mdi-help-circle-outline</v-icon
        >
      </template>
      <span>
        The number of TravCom records that match the provided filtering pattern and will be synced.
        <br />
        This does not distinguish between reconciled and unreconciled records as TravCom is not
        tracking that data.
        <br />
        <br />
        The best way to use this feature, is to go to the "All" flight expenses tab, and pick a date
        range.
        <br />
        If the number of records to be synced matches the number of records that are listed in the
        table, then the table is up to date.
        <br />
        If not, you can sync the filtered records and the table will now include those records as
        unreconciled entries.
      </span>
    </v-tooltip>
  </v-btn>
</template>

<script setup>
import { computed } from "vue"
import { isNil, isEmpty } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import flightReconciliationsApi from "@/api/flight-reconciliations-api"

import useSnack from "@/use/use-snack"
import useAccountsReceivableInvoiceDetails from "@/use/trav-com/use-accounts-receivable-invoice-details"

/** @typedef {import('@/api/trav-com/accounts-receivable-invoice-details-api.js').AccountsReceivableInvoiceDetailFiltersOptions} AccountsReceivableInvoiceDetailFiltersOptions */
/** @typedef {import('@/api/flight-reconciliations-api.js').FlightReconciliationFiltersOptions} FlightReconciliationFiltersOptions */

/** @typedef {keyof AccountsReceivableInvoiceDetailFiltersOptions & keyof FlightReconciliationFiltersOptions} CommonFilterOptions */
/** @typedef {Pick<AccountsReceivableInvoiceDetailFiltersOptions & FlightReconciliationFiltersOptions, CommonFilterOptions>} SyncWithTravComBtnFilterOptions */

/** @type {{ filters: SyncWithTravComBtnFilterOptions }} */
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["synced"])

const accountsReceivableInvoiceDetailsQuery = computed(() => ({
  filters: props.filters,
  perPage: 1,
}))
const { totalCount, isLoading } = useAccountsReceivableInvoiceDetails(
  accountsReceivableInvoiceDetailsQuery
)

const snack = useSnack()

async function syncWithExternalDatabase() {
  if (isNil(props.filters) || isEmpty(props.filters)) {
    if (
      !blockedToTrueConfirm(
        "Are you sure you want to sync _all_ of TravCom?\nThis will take a long time."
      )
    )
      return
  }

  isLoading.value = true
  try {
    await flightReconciliationsApi.sync({
      filters: props.filters,
    })
    emit("synced")
    snack.success("Synced with TravCom.")
  } catch (error) {
    console.error(`Failed to sync with TravCom: ${error}`, { error })
    snack.error(`Failed to sync with TravCom: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
