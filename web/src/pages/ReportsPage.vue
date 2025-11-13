<template>
  <v-card
    :loading="isLoading"
    :disabled="isLoading"
    en
    class="px-5 pb-15"
  >
    <v-skeleton-loader
      v-if="isLoading"
      type="card"
    />
    <div v-else>
      <v-card
        class="mt-5"
        flat
      >
        <v-card-title class="text-h5 mx-5">Travel Summary</v-card-title>

        <v-card-actions class="mx-8">
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
              <v-icon right> {{ showFilters ? "mdi-chevron-down" : "mdi-chevron-right" }} </v-icon>
            </v-badge>
          </v-btn>
          <v-btn
            class="ml-4"
            color="primary"
            outlined
            @click="showGraphs = !showGraphs"
          >
            Graph
            <v-icon right> {{ showGraphs ? "mdi-chevron-down" : "mdi-chevron-right" }} </v-icon>
          </v-btn>
          <v-btn
            class="ml-auto"
            color="secondary"
            @click="openFlightStatisticsJobsModal"
          >
            Update Reports
          </v-btn>
        </v-card-actions>
      </v-card>

      <FlightStatisticsFiltersCard
        v-if="showFilters"
        v-model="filters"
        class="mt-5"
        @input="refreshGraphs"
      />

      <FlightStatisticsGraphsCard
        v-if="showGraphs"
        ref="flightStatisticsGraphsCardRef"
        class="mt-5"
        :filters="filtersAsBackendFilters"
      />

      <v-card
        class="mt-5"
        flat
      >
        <FlightReport :flight-report="frontEndFilteredFlightStatistics" />
      </v-card>
    </div>

    <FlightStatisticsJobsModal ref="flightStatisticsJobsModal" />
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { cloneDeep, isEmpty, sumBy } from "lodash"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useFlightStatistics, { type FlightStatisticAsIndex } from "@/use/use-flight-statistics"

import FlightReport from "@/modules/reports/views/FlightReport.vue"
import FlightStatisticsGraphsCard from "@/components/flight-statistics/FlightStatisticsGraphsCard.vue"
import FlightStatisticsFiltersCard, {
  type LocationCategory,
  type LocationsByRegion,
} from "@/components/flight-statistics/FlightStatisticsFiltersCard.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const { flightStatistics, isLoading } = useFlightStatistics()

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

const flightStatisticsGraphsCardRef = ref<InstanceType<typeof FlightStatisticsGraphsCard> | null>(
  null
)

function refreshGraphs() {
  flightStatisticsGraphsCardRef.value?.refresh()
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

const frontEndFilteredFlightStatistics = computed<FlightStatisticAsIndex[]>(() => {
  let localFlightStatistics = cloneDeep(flightStatistics.value)
  if (filters.value.departments?.length > 0) {
    localFlightStatistics = localFlightStatistics.filter(({ department }) =>
      filters.value.departments.includes(department)
    )
  }

  if (
    filters.value.locationSubCategories.Canada?.length > 0 ||
    filters.value.locationSubCategories.Yukon?.length > 0 ||
    filters.value.locationSubCategories.International?.length > 0
  ) {
    localFlightStatistics = localFlightStatistics.filter(
      ({ destinationCity, destinationProvince }) => {
        return (
          filters.value.locationSubCategories.Yukon?.includes(destinationCity) ||
          filters.value.locationSubCategories.Canada?.includes(destinationProvince) ||
          filters.value.locationSubCategories.International?.includes(destinationProvince)
        )
      }
    )
  }

  return localFlightStatistics
})

const flightStatisticsJobsModal = ref<InstanceType<typeof FlightStatisticsJobsModal>>()

function openFlightStatisticsJobsModal() {
  flightStatisticsJobsModal.value?.open()
}

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
