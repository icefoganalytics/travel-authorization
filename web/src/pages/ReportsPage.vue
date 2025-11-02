<template>
  <v-card
    :loading="loadingData"
    :disabled="loadingData"
    en
    class="px-5 pb-15"
  >
    <div
      v-if="loadingData"
      class="mt-10"
      style="text-align: center"
    >
      loading ...
    </div>

    <div v-else>
      <v-card
        class="mt-5"
        flat
      >
        <v-card-title class="text-h5 mx-5">Travel Summary</v-card-title>

        <v-card-actions class="mx-8">
          <v-btn
            :color="views.filters ? 'primary' : 'secondary'"
            @click="switchFilterView(views.filters)"
            >Filters
          </v-btn>
          <v-btn
            class="ml-4"
            :color="views.graphs ? 'primary' : 'secondary'"
            @click="switchGraphView(views.graphs)"
            >Graph
          </v-btn>
          <UpdateProgressModal class="ml-auto" />
        </v-card-actions>
      </v-card>

      <v-card
        v-if="views.filters"
        class="mt-5"
        flat
      >
        <Filters
          :flight-report="allFlightReports"
          @updateFilters="updateFilters"
        />
      </v-card>

      <v-card
        v-if="views.graphs"
        class="mt-5"
        flat
      >
        <Graphs
          :update-graph="updateGraph"
          :filters-applied="views.filters"
          :filtered-flight-report="flightReport"
          :all-flight-reports="allFlightReports"
        />
      </v-card>

      <v-card
        class="mt-5"
        flat
      >
        <FlightReport :flight-report="flightReport" />
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
export type TFlightReport = {
  dept: string
  finalDestinationCity: string
  finalDestinationProvince: string
}

export type LocationsByRegion = {
  Canada: string[]
  Yukon: string[]
  International: string[]
}
</script>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { cloneDeep } from "lodash"

import { TRAVEL_COM_URL } from "@/urls"
import http from "@/api/http-client"

import FlightReport from "@/modules/reports/views/FlightReport.vue"
import Filters from "@/modules/reports/views/Filters/Filters.vue"
import Graphs from "@/modules/reports/views/Graphs/Graphs.vue"
import UpdateProgressModal from "@/modules/reports/views/Common/UpdateProgressModal.vue"

const flightReport = ref<TFlightReport[]>([])
const allFlightReports = ref<TFlightReport[]>([])
const loadingData = ref(false)

const updateGraph = ref(0)

const views = ref({
  filters: false,
  graphs: false,
})
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
  loadingData.value = true
  try {
    initViews()
    await getFlights()
  } catch (error) {
    console.error(`Failed to initialize reports page: ${error}`, { error })
  } finally {
    loadingData.value = false
  }
})

function initViews() {
  views.value = {
    filters: false,
    graphs: false,
  }
}

function updateFilters(departments: string[], locations: LocationsByRegion) {
  filters.value = {
    departments,
    locations,
  }
  flightReport.value = applyFilters(allFlightReports.value)
  updateGraph.value++
}

async function getFlights() {
  loadingData.value = true
  try {
    const { data } = await http.get(`${TRAVEL_COM_URL}/statistics`)
    allFlightReports.value = data
    flightReport.value = applyFilters(allFlightReports.value)
  } catch (error) {
    console.error(`Failed to fetch flights: ${error}`, { error })
  } finally {
    loadingData.value = false
  }
}

function switchFilterView(display: boolean) {
  views.value.filters = !display
}

function switchGraphView(display: boolean) {
  views.value.graphs = !display
}

function applyFilters(allFlightReports: TFlightReport[]) {
  let flightReport = cloneDeep(allFlightReports)
  if (filters.value.departments?.length > 0) {
    flightReport = flightReport.filter((flight) => filters.value.departments.includes(flight.dept))
  }

  if (
    filters.value.locations.Canada?.length > 0 ||
    filters.value.locations.Yukon?.length > 0 ||
    filters.value.locations.International?.length > 0
  ) {
    flightReport = flightReport.filter((flight) => {
      return (
        filters.value.locations.Yukon?.includes(flight.finalDestinationCity) ||
        filters.value.locations.Canada?.includes(flight.finalDestinationProvince) ||
        filters.value.locations.International?.includes(flight.finalDestinationProvince)
      )
    })
  }

  return flightReport
}
</script>
