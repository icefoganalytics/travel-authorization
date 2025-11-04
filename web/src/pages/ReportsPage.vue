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
            :color="showFilters ? 'primary' : 'secondary'"
            @click="showFilters = !showFilters"
            >Filters
          </v-btn>
          <v-btn
            class="ml-4"
            :color="showGraphs ? 'primary' : 'secondary'"
            @click="showGraphs = !showGraphs"
            >Graph
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
        class="mt-5"
        :flight-report="flightStatistics"
        @updateFilters="updateFilters"
      />

      <v-card
        v-if="showGraphs"
        class="mt-5"
        flat
      >
        <Graphs
          :update-graph="updateGraph"
          :filters-applied="showFilters"
          :filtered-flight-report="frontEndFilteredFlightStatistics"
          :all-flight-reports="flightStatistics"
        />
      </v-card>

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

<script lang="ts">
export type LocationsByRegion = {
  Canada: string[]
  Yukon: string[]
  International: string[]
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { cloneDeep } from "lodash"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useFlightStatistics from "@/use/use-flight-statistics"

import FlightReport from "@/modules/reports/views/FlightReport.vue"
import Graphs from "@/modules/reports/views/Graphs/Graphs.vue"
import FlightStatisticsFiltersCard from "@/components/flight-statistics/FlightStatisticsFiltersCard.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const { flightStatistics, isLoading } = useFlightStatistics()

const showFilters = useRouteQuery("showFilters", "false", {
  transform: booleanTransformer,
})

const showGraphs = ref(false)
const updateGraph = ref(0)

const filters = ref<{
  departments: string[]
  locations: LocationsByRegion
}>({
  departments: [],
  locations: {
    Canada: [],
    Yukon: [],
    International: [],
  },
})

onMounted(async () => {
  reset()
})

function reset() {
  showGraphs.value = false
  updateGraph.value = 0
  filters.value = {
    departments: [],
    locations: {
      Canada: [],
      Yukon: [],
      International: [],
    },
  }
}

function updateFilters(departments: string[], locations: LocationsByRegion) {
  filters.value = {
    departments,
    locations,
  }
  updateGraph.value++
}

// TODO: move to backend
const frontEndFilteredFlightStatistics = computed(() => {
  let localFlightStatistics = cloneDeep(flightStatistics.value)
  if (filters.value.departments?.length > 0) {
    localFlightStatistics = localFlightStatistics.filter(({ department }) =>
      filters.value.departments.includes(department)
    )
  }

  if (
    filters.value.locations.Canada?.length > 0 ||
    filters.value.locations.Yukon?.length > 0 ||
    filters.value.locations.International?.length > 0
  ) {
    localFlightStatistics = localFlightStatistics.filter(
      ({ destinationCity, destinationProvince }) => {
        return (
          filters.value.locations.Yukon?.includes(destinationCity) ||
          filters.value.locations.Canada?.includes(destinationProvince) ||
          filters.value.locations.International?.includes(destinationProvince)
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
</script>
