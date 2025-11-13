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
              :filters="filtersAsBackendFilters"
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
                :filters="filtersAsBackendFilters"
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
        :filters="filtersAsBackendFilters"
      />
      <FlightStatisticsDataTable
        v-else
        class="mt-4"
        :filters="filtersAsBackendFilters"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { isEmpty, sumBy } from "lodash"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import FlightStatisticsDataTable from "@/components/flight-statistics/FlightStatisticsDataTable.vue"
import FlightStatisticsGraphsCard from "@/components/flight-statistics/FlightStatisticsGraphsCard.vue"
import FlightStatisticsFiltersCard, {
  type LocationCategory,
  type LocationsByRegion,
} from "@/components/flight-statistics/FlightStatisticsFiltersCard.vue"
import FlightStatisticsExportToCsvButton from "@/components/flight-statistics/FlightStatisticsExportToCsvButton.vue"
import FlightStatisticsPrintDialog from "@/components/flight-statistics/FlightStatisticsPrintDialog.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const showFilters = useRouteQuery("showFilters", "false", {
  transform: booleanTransformer,
})
const showGraphs = useRouteQuery("showGraphs", "false", {
  transform: booleanTransformer,
})

// TODO: Store state with useRouteQuery.
const filters = ref<{
  departments: string[]
  locationCategories: LocationCategory[]
  locationSubCategories: LocationsByRegion
}>({
  departments: [],
  locationCategories: [],
  locationSubCategories: {
    Yukon: [],
    Canada: [],
    International: [],
  },
})

// TODO: replace front-end filters with these, and rename to "filters"
const filtersAsBackendFilters = computed(() => {
  const backendFilters: {
    byDepartments?: string[]
    byYukonDestinationCities?: string[]
    byCanadianDestinationProvinces?: string[]
    byInternationalDestinationProvinces?: string[]
  } = {}

  if (!isEmpty(filters.value.departments)) {
    backendFilters.byDepartments = filters.value.departments
  }

  if (!isEmpty(filters.value.locationSubCategories.Yukon)) {
    backendFilters.byYukonDestinationCities = filters.value.locationSubCategories.Yukon
  }

  if (!isEmpty(filters.value.locationSubCategories.Canada)) {
    backendFilters.byCanadianDestinationProvinces = filters.value.locationSubCategories.Canada
  }

  if (!isEmpty(filters.value.locationSubCategories.International)) {
    backendFilters.byInternationalDestinationProvinces =
      filters.value.locationSubCategories.International
  }

  return backendFilters
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
      filters.value.departments,
      filters.value.locationSubCategories.Canada,
      filters.value.locationSubCategories.Yukon,
      filters.value.locationSubCategories.International,
    ],
    (filter) => filter.length
  )
})

// TODO: store state in route query, only reset if filters are removed
onMounted(async () => {
  reset()
})

function reset() {
  resetFilters()
}

function resetFilters() {
  filters.value = {
    departments: [],
    locationCategories: [],
    locationSubCategories: {
      Canada: [],
      Yukon: [],
      International: [],
    },
  }
}

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
