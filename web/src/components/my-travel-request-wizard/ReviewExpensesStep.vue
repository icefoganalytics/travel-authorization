<template>
  <div class="mt-4">
    <v-alert
      v-if="isExpenseClaimDenied"
      type="error"
      class="mb-4"
      title="Your expense claim has been denied."
    >
      <template #text>
        <span class="text-pre-wrap">{{
          travelAuthorization?.denialReason ?? "No reason provided."
        }}</span>
      </template>
    </v-alert>
    <v-row>
      <v-col>
        <h3>Traveler Expenses</h3>
        <ExpensesDataTableServer :where="expenseWhere">
          <template #footerNote> * Meals and Incidentals are not included in this table. </template>
        </ExpensesDataTableServer>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Meals and Incidentals</h3>
        <MealsAndIncidentalsTable :travel-authorization-id="travelAuthorizationId" />
      </v-col>
      <v-col>
        <h3>Totals</h3>
        <TotalsTable
          :travel-authorization-id="travelAuthorizationId"
          class="bg-white py-4"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Coding</h3>
        <GeneralLedgerCodingsTable :travel-authorization-id="travelAuthorizationId" />
      </v-col>
      <v-col cols="4"></v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"

import { ExpenseExpenseTypes, type ExpenseWhereOptions } from "@/use/use-expenses"
import useTravelAuthorization, { TravelAuthorizationStatuses } from "@/use/use-travel-authorization"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

import ExpensesDataTableServer from "@/components/expenses/ExpensesDataTableServer.vue"

import GeneralLedgerCodingsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/GeneralLedgerCodingsTable.vue"
import MealsAndIncidentalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/MealsAndIncidentalsTable.vue"
import TotalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/TotalsTable.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)
const isExpenseClaimDenied = computed(
  () => travelAuthorization.value?.status === TravelAuthorizationStatuses.EXPENSE_CLAIM_DENIED
)
const expenseWhere = computed<ExpenseWhereOptions>(() => ({
  travelAuthorizationId: props.travelAuthorizationId,
  expenseType: [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION],
}))

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([])
}

defineExpose({
  initialize,
  continue: () => true,
})
</script>
