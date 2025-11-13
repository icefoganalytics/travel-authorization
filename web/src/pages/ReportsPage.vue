<template>
  <v-card>
    <v-card-title>
      <h2>Reports</h2>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col class="d-flex justify-space-between">
          <div>
            <v-btn
              color="primary"
              outlined
              @click="showGraphs = !showGraphs"
            >
              Graph
              <v-icon right> {{ showGraphs ? "mdi-chevron-down" : "mdi-chevron-right" }} </v-icon>
            </v-btn>
            <v-btn
              color="primary"
              class="ml-2"
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
        @input="refreshGraphs"
      />

      <FlightStatisticsGraphsCard
        v-if="showGraphs"
        ref="flightStatisticsGraphsCardRef"
        class="mt-4"
        :filters="filters"
      />
      <FlightStatisticsDataTable
        v-else
        class="mt-4"
        :filters="filters"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { sumBy } from "lodash"

import useRouteQuery, { booleanTransformer, jsonTransformer } from "@/use/utils/use-route-query"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import { type FlightStatisticFiltersOptions } from "@/api/flight-statistics-api"

import FlightStatisticsDataTable from "@/components/flight-statistics/FlightStatisticsDataTable.vue"
import FlightStatisticsGraphsCard from "@/components/flight-statistics/FlightStatisticsGraphsCard.vue"
import FlightStatisticsFiltersCard from "@/components/flight-statistics/FlightStatisticsFiltersCard.vue"
import FlightStatisticsExportToCsvButton from "@/components/flight-statistics/FlightStatisticsExportToCsvButton.vue"
import FlightStatisticsPrintDialog from "@/components/flight-statistics/FlightStatisticsPrintDialog.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const showGraphs = useRouteQuery("showGraphs", "false", {
  transform: booleanTransformer,
})

const showFilters = useRouteQuery("showFilters", "false", {
  transform: booleanTransformer,
})
const filters = useRouteQuery<string, FlightStatisticFiltersOptions>("filters", "{}", {
  transform: jsonTransformer,
})

const { isAdmin } = useCurrentUser<true>()

const flightStatisticsGraphsCardRef = ref<InstanceType<typeof FlightStatisticsGraphsCard> | null>(
  null
)

function refreshGraphs() {
  flightStatisticsGraphsCardRef.value?.refresh()
}

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

const breadcrumbs = ref([
  {
    text: "Reports",
    to: {
      name: "ReportsPage",
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped>
.-mb-\[79px\] {
  margin-bottom: -79px;
}
</style>
