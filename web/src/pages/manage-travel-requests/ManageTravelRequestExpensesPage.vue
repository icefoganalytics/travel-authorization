<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <h3>Traveler Expenses</h3>
        <ExpensesTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
        * Meals and Incidentals are not included in this table.
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Meals and Incidentals</h3>
        <MealsAndIncidentalsTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
      <v-col>
        <h3>Totals</h3>
        <TotalsTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Coding</h3>
        <GeneralLedgerCodingsTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
      <v-col cols="4"></v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Management</h3>
        <ManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="emit('updated')"
          @rejected="emit('updated')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import ExpensesTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/ExpensesTable.vue"
import GeneralLedgerCodingsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/GeneralLedgerCodingsTable.vue"
import MealsAndIncidentalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/MealsAndIncidentalsTable.vue"
import TotalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/TotalsTable.vue"

import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ManagementCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

useBreadcrumbs([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    text: "Expenses",
    to: {
      name: "manage-travel-requests/ManageTravelRequestExpensesPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber,
      },
    },
  },
])
</script>
