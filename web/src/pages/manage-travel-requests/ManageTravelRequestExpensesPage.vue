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
        <ManagementCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TravelAuthorizationActionLogsTable
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"

import TravelAuthorizationActionLogsTable from "@/modules/travel-authorizations/components/TravelAuthorizationActionLogsTable"

import ExpensesTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/ExpensesTable"
import GeneralLedgerCodingsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/GeneralLedgerCodingsTable"
import MealsAndIncidentalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/MealsAndIncidentalsTable"
import TotalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/TotalsTable"

import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ManagementCard"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
</script>
