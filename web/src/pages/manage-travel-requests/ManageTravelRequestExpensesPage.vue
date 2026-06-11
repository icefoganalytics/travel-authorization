<template>
  <div>
    <v-alert
      v-if="isExpenseClaimSupervisorChangesRequested"
      type="warning"
      class="mb-4"
      title="Finance has requested changes to this expense claim."
    >
      <template #text>
        <span class="text-pre-wrap">{{
          travelAuthorization?.requestChange ?? "No reason provided."
        }}</span>
      </template>
    </v-alert>
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
      <v-col>
        <TravelAuthorizationExpenseTotalsCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <HeaderActionsCard title="Coding">
          <template #header-actions>
            <GeneralLedgerCodingCreateDialog
              :travel-authorization-id="travelAuthorizationIdAsNumber"
              :activator-props="{
                class: 'my-0',
              }"
              @created="emit('updated')"
            />
          </template>
          <GeneralLedgerCodingsEditDataTableServer
            :where="generalLedgerCodingsWhere"
            @changed="emit('updated')"
          />
        </HeaderActionsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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

import { ExpenseExpenseTypes } from "@/api/expenses-api"

import useTravelAuthorization, { TravelAuthorizationStatuses } from "@/use/use-travel-authorization"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

import ExpensesEditDataTableServer from "@/components/expenses/ExpensesEditDataTableServer.vue"
import GeneralLedgerCodingCreateDialog from "@/components/general-ledger-codings/GeneralLedgerCodingCreateDialog.vue"
import GeneralLedgerCodingsEditDataTableServer from "@/components/general-ledger-codings/GeneralLedgerCodingsEditDataTableServer.vue"

import TravelAuthorizationExpenseTotalsCard from "@/components/travel-authorizations/expenses/TravelAuthorizationExpenseTotalsCard.vue"
import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ManagementCard.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const emit = defineEmits<{
  updated: [void]
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const { travelAuthorization } = useTravelAuthorization(travelAuthorizationIdAsNumber)
const isExpenseClaimSupervisorChangesRequested = computed(
  () =>
    travelAuthorization.value?.status ===
    TravelAuthorizationStatuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED
)

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
    title: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    title: "Expenses",
    to: {
      name: "manage-travel-requests/ManageTravelRequestExpensesPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber,
      },
    },
  },
])
</script>
