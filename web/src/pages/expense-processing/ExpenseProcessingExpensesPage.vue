<template>
  <div>
    <v-row>
      <v-col>
        <HeaderActionsCard title="Traveler Expenses">
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
        </HeaderActionsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <HeaderActionsCard title="Meals and Incidentals">
          <ExpensesEditDataTableServer
            :where="mealsAndIncidentalsWhere"
            route-query-suffix="MealsAndIncidentals"
            @changed="emit('updated')"
          />
        </HeaderActionsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TravelAuthorizationExpenseTotalsCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <HeaderActionsCard title="Coding">
          <GeneralLedgerCodingsEditDataTableServer
            :where="generalLedgerCodingsWhere"
            @changed="emit('updated')"
          />
        </HeaderActionsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <FinanceManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="emit('updated')"
          @denied="emit('updated')"
          @changes-requested="emit('updated')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import { ExpenseExpenseTypes } from "@/api/expenses-api"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import ExpensesEditDataTableServer from "@/components/expenses/ExpensesEditDataTableServer.vue"
import GeneralLedgerCodingsEditDataTableServer from "@/components/general-ledger-codings/GeneralLedgerCodingsEditDataTableServer.vue"
import FinanceManagementCard from "@/components/travel-authorizations/finance/TravelAuthorizationFinanceManagementCard.vue"
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
