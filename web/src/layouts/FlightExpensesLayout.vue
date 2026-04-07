<template>
  <v-card :loading="waiting">
    <v-card-title>
      <h2 class="mb-md-0">Flight Expenses</h2>
    </v-card-title>
    <v-card-text>
      <v-tabs show-arrows>
        <v-tab
          :to="{
            name: 'flight-expenses/AllFlightExpensesPage',
            query: $route.query,
          }"
        >
          All
        </v-tab>
        <v-tab
          :to="{
            name: 'flight-expenses/UnreconciledFlightExpensesPage',
            query: $route.query,
          }"
        >
          Unreconciled
        </v-tab>
        <v-tab
          :to="{
            name: 'flight-expenses/ReconciledFlightExpensesPage',
            query: $route.query,
          }"
        >
          Reconciled
        </v-tab>
      </v-tabs>

      <v-row class="mt-4">
        <v-col
          cols="12"
          md="6"
        >
          <DateRangeTableFilterDiv
            v-model="dateRange"
            v-model:loaded="loadedDateRangeTableFilterDiv"
          />
        </v-col>
        <v-spacer />
        <v-col
          cols="12"
          md="4"
        >
          <SyncWithTravComBtn
            class="my-0"
            :filters="filters"
            color="secondary"
            block
            @synced="refresh"
          />
        </v-col>
      </v-row>

      <router-view
        ref="routerViewComponent"
        :start-date="startDate"
        :end-date="endDate"
      ></router-view>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue"
import { isNil, isEmpty } from "lodash"

import SyncWithTravComBtn from "@/components/flight-reconciliations/SyncWithTravComBtn.vue"
import DateRangeTableFilterDiv from "@/components/flight-reconciliations/tables/DateRangeTableFilterDiv.vue"

const dateRange = ref([])

const startDate = computed(() => dateRange.value[0])
const endDate = computed(() => dateRange.value[1])

const filters = computed(() => {
  if (isNil(dateRange.value) || isEmpty(dateRange.value)) return {}

  return {
    invoiceBookingDateBetween: dateRange.value,
  }
})

const loadedDateRangeTableFilterDiv = ref(false)
const waiting = computed(() =>
  [loadedDateRangeTableFilterDiv.value].some((loaded) => loaded === false)
)

const routerViewComponent = ref(null)

async function refresh() {
  await routerViewComponent.value?.refresh()
}
</script>
