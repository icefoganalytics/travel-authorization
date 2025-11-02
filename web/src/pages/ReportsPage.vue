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
          <update-progress-modal class="ml-auto" />
        </v-card-actions>
      </v-card>

      <v-card
        v-if="views.filters"
        class="mt-5"
        flat
      >
        <filters
          :flight-report="allFlightReports"
          @updateFilters="updateFilters"
        />
      </v-card>

      <v-card
        v-if="views.graphs"
        class="mt-5"
        flat
      >
        <graphs
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
        <flight-report :flight-report="flightReport" />
      </v-card>
    </div>
  </v-card>
</template>

<script>
import { TRAVEL_COM_URL, PROFILE_URL } from "@/urls"
import http from "@/api/http-client"

import FlightReport from "@/modules/reports/views/FlightReport.vue"
import Filters from "@/modules/reports/views/Filters/Filters.vue"
import Graphs from "@/modules/reports/views/Graphs/Graphs.vue"
import UpdateProgressModal from "@/modules/reports/views/Common/UpdateProgressModal.vue"

export default {
  name: "ReportsPage",
  components: {
    FlightReport,
    Filters,
    Graphs,
    UpdateProgressModal,
  },
  data() {
    return {
      views: { filters: false, graphs: false },
      flightReport: [],
      allFlightReports: [],
      loadingData: false,
      updateGraph: 0,
      filters: { departments: [], locations: [] },
    }
  },
  async mounted() {
    this.loadingData = true
    this.initViews()
    // await this.getUserAuth();
    await this.getFlights()
    this.loadingData = false
  },

  methods: {
    initViews() {
      this.views = {
        filters: false,
        graphs: false,
      }
    },

    updateFilters(departments, locations) {
      this.filters = { departments: departments, locations: locations }
      this.flightReport = this.applyFilters(this.allFlightReports)
      this.updateGraph++
    },

    async getUserAuth() {
      return http
        .get(PROFILE_URL)
        .then((resp) => {
          this.$store.commit("auth/setUser", resp.data.user)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getFlights() {
      return http
        .get(`${TRAVEL_COM_URL}/statistics`)
        .then(async (resp) => {
          console.log(resp.data)
          this.allFlightReports = resp.data
          this.flightReport = this.applyFilters(this.allFlightReports)
        })
        .catch((e) => {
          console.log(e)
          this.loadingData = false
        })
    },

    switchFilterView(display) {
      this.views.filters = !display
    },

    switchGraphView(display) {
      this.views.graphs = !display
    },

    applyFilters(allFlightReports) {
      let flightReport = JSON.parse(JSON.stringify(allFlightReports))
      if (this.filters.departments?.length > 0) {
        flightReport = flightReport.filter((flight) =>
          this.filters.departments.includes(flight.dept)
        )
      }

      if (
        this.filters.locations.Canada?.length > 0 ||
        this.filters.locations.Yukon?.length > 0 ||
        this.filters.locations.International?.length > 0
      ) {
        flightReport = flightReport.filter((flight) => {
          return (
            this.filters.locations.Yukon?.includes(flight.finalDestinationCity) ||
            this.filters.locations.Canada?.includes(flight.finalDestinationProvince) ||
            this.filters.locations.International?.includes(flight.finalDestinationProvince)
          )
        })
      }

      return flightReport
    },
  },
}
</script>
