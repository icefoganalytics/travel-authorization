<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <h3>Traveler Expenses</h3>
        <ExpensesTable :travel-authorization-id="travelAuthorizationId" />
        * Meals and Incidentals are not included in this table.
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
          class="white"
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

<script setup>
import ExpensesTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/ExpensesTable.vue"
import GeneralLedgerCodingsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/GeneralLedgerCodingsTable.vue"
import MealsAndIncidentalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/MealsAndIncidentalsTable.vue"
import TotalsTable from "@/modules/travel-authorizations/components/read-travel-authorization-expense-page/TotalsTable.vue"

defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

async function initialize(context) {
  context.setEditableSteps([])
}

defineExpose({
  initialize,
  continue: () => true,
})
</script>
