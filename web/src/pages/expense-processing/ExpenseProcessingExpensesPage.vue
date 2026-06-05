<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <h3>Traveler Expenses</h3>
        <ExpensesEditDataTableServer
          :where="travelerExpensesWhere"
          route-query-suffix="TravelerExpenses"
          @changed="emit('updated')"
        >
          <template #footerNote>
            <span class="text-body-2 text-none">
              * Meals and Incidentals are not included in this table.
            </span>
          </template>
        </ExpensesEditDataTableServer>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Meals and Incidentals</h3>
        <ExpensesEditDataTableServer
          :where="mealsAndIncidentalsWhere"
          route-query-suffix="MealsAndIncidentals"
          @changed="emit('updated')"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Totals</h3>
        <TravelAuthorizationExpenseTotalsCard
          class="py-4"
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Coding</h3>
        <GeneralLedgerCodingsEditDataTableServer
          :where="generalLedgerCodingsWhere"
          @changed="emit('updated')"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Management</h3>
        <ManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="emit('updated')"
          @denied="emit('updated')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import { ExpenseExpenseTypes } from "@/api/expenses-api"
import ExpensesEditDataTableServer from "@/components/expenses/ExpensesEditDataTableServer.vue"
import GeneralLedgerCodingsEditDataTableServer from "@/components/general-ledger-codings/GeneralLedgerCodingsEditDataTableServer.vue"
import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ManagementCard.vue"
import TravelAuthorizationExpenseTotalsCard from "@/components/travel-authorizations/expenses/TravelAuthorizationExpenseTotalsCard.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const emit = defineEmits<{
  updated: [void]
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const travelerExpensesWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationIdAsNumber.value,
  expenseType: [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION],
}))

const mealsAndIncidentalsWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationIdAsNumber.value,
  expenseType: ExpenseExpenseTypes.MEALS_AND_INCIDENTALS,
}))

const generalLedgerCodingsWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationIdAsNumber.value,
}))

useBreadcrumbs([
  {
    title: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
  {
    title: "Expenses",
  },
])
</script>
