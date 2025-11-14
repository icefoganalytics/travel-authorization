<template>
  <v-card>
    <v-card-title>
      <h2>Reports</h2>
    </v-card-title>

    <v-card-text>
      <v-tabs show-arrows>
        <v-tab
          :to="{
            name: 'reports/ReportsTablePage',
            query: route.query,
          }"
        >
          Table
        </v-tab>
        <v-tab
          :to="{
            name: 'reports/ReportsGraphPage',
            query: route.query,
          }"
        >
          Graph
        </v-tab>
      </v-tabs>

      <v-row class="mt-4">
        <v-col class="d-flex justify-space-between">
          <div>
            <v-btn
              color="primary"
              outlined
              @click="showFilters = !showFilters"
            >
              <v-badge
                color="warning"
                :content="totalActiveFilters"
                :value="totalActiveFilters"
              >
                Filters
                <v-icon right>
                  {{ showFilters ? "mdi-chevron-down" : "mdi-chevron-right" }}
                </v-icon>
              </v-badge>
            </v-btn>
          </div>
          <div
            v-if="isAdmin"
            class="d-flex justify-end"
          >
            <FlightStatisticsExportToCsvButton
              :filters="filters"
              color="primary"
              outlined
            />

            <v-btn
              class="ml-2"
              color="primary"
              outlined
              @click="openFlightStatisticsPrintDialog"
            >
              Print Report
              <FlightStatisticsPrintDialog
                ref="flightStatisticsPrintDialog"
                :filters="filters"
              />
            </v-btn>
            <v-btn
              class="ml-2"
              color="primary"
              outlined
              @click="openFlightStatisticsJobsModal"
            >
              Update Reports
              <FlightStatisticsJobsModal ref="flightStatisticsJobsModal" />
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <FlightStatisticsFiltersCard
        v-if="showFilters"
        v-model="filters"
      />

      <v-fade-transition>
        <router-view
          class="mt-4"
          :filters="filters"
        />
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { sumBy } from "lodash"
import { useRoute } from "vue2-helpers/vue-router"

import useRouteQuery, { booleanTransformer, jsonTransformer } from "@/use/utils/use-route-query"
import useBreadcrumbs, { type BreadcrumbItem } from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import { type FlightStatisticFiltersOptions } from "@/api/flight-statistics-api"

import FlightStatisticsFiltersCard from "@/components/flight-statistics/FlightStatisticsFiltersCard.vue"
import FlightStatisticsExportToCsvButton from "@/components/flight-statistics/FlightStatisticsExportToCsvButton.vue"
import FlightStatisticsPrintDialog from "@/components/flight-statistics/FlightStatisticsPrintDialog.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const showFilters = useRouteQuery("showFilters", "false", {
  transform: booleanTransformer,
})
const filters = useRouteQuery<string, FlightStatisticFiltersOptions>("filters", "{}", {
  transform: jsonTransformer,
})

const route = useRoute()

const { isAdmin } = useCurrentUser<true>()

const flightStatisticsPrintDialog = ref<InstanceType<typeof FlightStatisticsPrintDialog> | null>(
  null
)

function openFlightStatisticsPrintDialog() {
  flightStatisticsPrintDialog.value?.open()
}

const flightStatisticsJobsModal = ref<InstanceType<typeof FlightStatisticsJobsModal>>()

function openFlightStatisticsJobsModal() {
  flightStatisticsJobsModal.value?.open()
}

const totalActiveFilters = computed(() => {
  return sumBy(
    [
      filters.value.byDepartments,
      filters.value.byYukonDestinationCities,
      filters.value.byCanadianDestinationProvinces,
      filters.value.byInternationalDestinationProvinces,
    ],
    (filter) => filter?.length ?? 0
  )
})

const breadcrumbs = computed(() => {
  const crumbs: BreadcrumbItem[] = [
    {
      text: "Reports",
      to: {
        name: "reports/ReportsTablePage",
      },
    },
  ]

  if (route.name === "reports/ReportsGraphPage") {
    crumbs.push({
      text: "Graph",
      to: {
        name: "reports/ReportsGraphPage",
      },
      exact: false,
    })
  } else if (route.name === "reports/ReportsTablePage") {
    crumbs.push({
      text: "Table",
      to: {
        name: "reports/ReportsTablePage",
      },
      exact: false,
    })
  }

  return crumbs
})

useBreadcrumbs(breadcrumbs)
</script>

<style scoped></style>
