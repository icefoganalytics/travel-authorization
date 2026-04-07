<template>
  <v-data-table
    :headers="headers"
    :items="generalLedgerCodings"
    :items-per-page="10"
    :loading="isLoading"
    class="elevation-2"
  >
    <template #item.amount="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup>
import { sumBy } from "lodash"
import { computed, ref } from "vue"

import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const generalLedgerCodingOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
}))
const { generalLedgerCodings, isLoading } = useGeneralLedgerCodings(generalLedgerCodingOptions)
const totalAmount = computed(() => sumBy(generalLedgerCodings.value, "amount"))

const headers = ref([
  { text: "Vote/Program/Object/Sub1/Sub2", value: "code" },
  { text: "Amount", value: "amount" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  })
  return formatter.format(amount)
}
</script>
