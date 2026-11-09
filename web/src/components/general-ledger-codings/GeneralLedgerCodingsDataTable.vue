<template>
  <v-data-table
    :headers="headers"
    :items="generalLedgerCodings"
    :items-per-page="10"
    :loading="isLoading"
  >
    <template #item.amount="{ value }">
      {{ formatCurrency(value, "CAD", currencyFormatOptions) }}
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">
            {{ formatCurrency(totalAmount, "CAD", currencyFormatOptions) }}
          </td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { sumBy } from "lodash"
import { computed, ref } from "vue"

import { formatCurrency } from "@/utils/formatters"

import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const generalLedgerCodingOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
}))
const { generalLedgerCodings, isLoading } = useGeneralLedgerCodings(generalLedgerCodingOptions)
const totalAmount = computed(() => sumBy(generalLedgerCodings.value, "amount"))

const headers = ref([
  { title: "Vote/Program/Object/Sub1/Sub2", key: "code" },
  { title: "Amount", key: "amount" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")
const currencyFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}
</script>
