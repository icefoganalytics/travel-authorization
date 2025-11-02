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
    <v-alert
      v-if="alertMsg"
      class="mt-5"
      type="warning"
      >{{ alertMsg }}</v-alert
    >

    <div v-if="!loadingData">
      <v-row>
        <v-col
          style="margin: 5rem 0"
          cols="8"
        >
          <div
            v-if="tabs == 0"
            id="chart"
            :key="pieId"
          >
            <div
              v-if="series.length == 0"
              class="text-h5"
            >
              No data available
            </div>
            <apexchart
              type="pie"
              height="550"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </div>

          <div
            v-else-if="tabs == 1"
            id="chart"
            :key="barId"
          >
            <apexchart
              type="bar"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </div>

          <!-- <div v-else-if="tabs == 2" id="chart" :key="lineId">
                        <apexchart type="line" :options="chartOptions" :series="series"></apexchart>
                    </div> -->
        </v-col>
        <v-col cols="4">
          <v-card style="border: 0px solid white !important">
            <v-toolbar
              v-if="!loadingData"
              class=""
              height="20px"
              flat
            >
              <template #extension>
                <v-tabs
                  v-model="tabs"
                  active-class="primary--text teal lighten-5"
                  @change="selectTab()"
                >
                  <v-tab>Pie</v-tab>
                  <v-tab>Bar</v-tab>
                  <!-- <v-tab>Line</v-tab> -->
                </v-tabs>
              </template>
            </v-toolbar>

            <v-tabs-items
              v-if="!loadingData"
              v-model="tabs"
            >
              <v-tab-item>
                <v-checkbox
                  v-if="filtersApplied"
                  v-model="filteredData"
                  label="Use Filtered Data"
                  class="ml-4"
                  hide-details
                  @change="getData()"
                />
                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(pieGroup, pieGroupInx) in chartsFilter.groupBy"
                    :key="pieGroupInx"
                    v-model="pieChartSelectedGroupBy"
                  >
                    <v-radio
                      :value="pieGroup"
                      :label="pieGroup"
                      @change="selectPieOption"
                    />
                  </v-radio-group>
                </v-card>

                <div class="my-3 ml-4">Show</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(pieShow, pieShowInx) in chartsFilter.show"
                    :key="pieShowInx"
                    v-model="pieChartSelectedDisplayFields"
                  >
                    <v-radio
                      :value="pieShow"
                      :label="pieShow"
                      @change="selectPieOption"
                    />
                  </v-radio-group>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-checkbox
                  v-if="filtersApplied"
                  v-model="filteredData"
                  label="Use Filtered Data"
                  class="ml-4"
                  hide-details
                  @change="getData()"
                />

                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(barGroup, barGroupInx) in chartsFilter.groupBy"
                    :key="barGroupInx"
                    v-model="barChartSelectedGroupBy"
                  >
                    <v-radio
                      :value="barGroup"
                      :label="barGroup"
                      @change="selectBarOption"
                    />
                  </v-radio-group>
                </v-card>

                <div class="my-3 ml-4">Show</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(barShow, barShowInx) in chartsFilter.show"
                    :key="barShowInx"
                    v-model="barChartSelectedDisplayFields"
                  >
                    <v-radio
                      :value="barShow"
                      :label="barShow"
                      @change="selectBarOption"
                    />
                  </v-radio-group>
                </v-card>
              </v-tab-item>
              <!-- <v-tab-item>

                                <v-checkbox v-if="filtersApplied" v-model="filteredData" label="Use Filtered Data"
                                    class="ml-4"
                                    value="true"
                                    hide-details/>
                                <div class="my-3 ml-4">Group By</div>

                                <v-card style="padding: 1.5rem;" class="mt-2 mx-4" flat>
                                    <v-radio-group
                                        v-model="lineChartSelectedGroupBy"
                                        v-for="(lineGroup, lineGroupInx) in chartsFilter.groupBy"
                                        :key="lineGroupInx">
                                        <v-radio @change="selectLineOption" :value="lineGroup" :label="lineGroup"/>
                                    </v-radio-group>
                                </v-card>

                                <div class="my-3 ml-4">Show</div>

                                <v-card style="padding: 1.5rem;" class="mt-2 mx-4" flat>
                                    <v-radio-group
                                        v-model="lineChartSelectedDisplayFields"
                                        v-for="(lineShow, lineShowInx) in chartsFilter.show"
                                        :key="lineShowInx">
                                        <v-radio @change="selectLineOption" :value="lineShow" :label="lineShow"/>
                                    </v-radio-group>
                                </v-card>

                            </v-tab-item> -->
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import Vue from "vue"

export default {
  name: "Graphs",
  props: {
    filtersApplied: {
      type: Boolean,
    },
    allFlightReports: {
      type: Array,
      default: () => [],
    },
    filteredFlightReport: {
      type: Array,
      default: () => [],
    },
    updateGraph: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      tabs: 0,
      series: [],
      chartOptions: {},
      flightReport: [],
      filteredData: false,

      chartsFilter: {
        groupBy: ["Destination City", "Province", "Department"],
        show: ["Total Trips", "Total Expences", "Total Flight Cost", "Average Duration"],
      },

      pieChartSelectedGroupBy: null,
      pieChartSelectedDisplayFields: null,

      lineChartSelectedGroupBy: null,
      lineChartSelectedDisplayFields: null,

      barChartSelectedGroupBy: null,
      barChartSelectedDisplayFields: null,

      pieId: 0,
      barId: 0,
      lineId: 0,

      loadingData: false,
      alertMsg: "",
    }
  },
  watch: {
    updateGraph() {
      this.getData()
    },
  },
  mounted() {
    this.initFilters()
  },
  methods: {
    initFilters() {
      this.pieChartSelectedGroupBy = null
      this.pieChartSelectedDisplayFields = null

      this.barChartSelectedGroupBy = null
      this.barChartSelectedDisplayFields = null

      this.lineChartSelectedGroupBy = null
      this.lineChartSelectedDisplayFields = null

      this.getData()
    },

    getData() {
      this.loadingData = true
      if (this.filteredData) {
        this.flightReport = JSON.parse(JSON.stringify(this.filteredFlightReport))
      } else {
        this.flightReport = JSON.parse(JSON.stringify(this.allFlightReports))
      }
      this.selectTab()
      Vue.nextTick(() => (this.loadingData = false))
    },

    selectTab() {
      if (this.tabs == 0) {
        this.pieChartSelectedGroupBy = "Destination City"
        this.pieChartSelectedDisplayFields = "Total Trips"
        this.selectPieOption()
      } else if (this.tabs == 1) {
        this.barChartSelectedGroupBy = "Destination City"
        this.barChartSelectedDisplayFields = "Total Trips"
        this.selectBarOption()
      } else if (this.tabs == 2) {
        this.lineChartSelectedGroupBy = "Destination City"
        this.lineChartSelectedDisplayFields = "Total Trips"
        this.selectLineOption()
      }
    },

    selectPieOption() {
      Vue.nextTick(() => {
        if (this.pieChartSelectedGroupBy && this.pieChartSelectedDisplayFields) {
          this.extractData(this.pieChartSelectedGroupBy, this.pieChartSelectedDisplayFields)
        }
        this.pieId++
      })
    },

    selectBarOption() {
      Vue.nextTick(() => {
        if (this.barChartSelectedGroupBy && this.barChartSelectedDisplayFields) {
          this.extractData(this.barChartSelectedGroupBy, this.barChartSelectedDisplayFields)
        }
        this.barId++
      })
    },

    selectLineOption() {
      Vue.nextTick(() => {
        if (this.lineChartSelectedGroupBy && this.lineChartSelectedDisplayFields) {
          this.extractData(this.lineChartSelectedGroupBy, this.lineChartSelectedDisplayFields)
        }
        this.lineId++
      })
    },

    extractData(labelGroup, displayFields) {
      if (labelGroup == "Destination City") {
        this.setupValues("finalDestinationCity", displayFields)
      } else if (labelGroup == "Province") {
        this.setupValues("finalDestinationProvince", displayFields)
      } else if (labelGroup == "Department") {
        this.setupValues("dept", displayFields)
      }
    },

    setupValues(labelField, displayFields) {
      const values = []
      let categories = []

      const existingCategories = this.flightReport.map((flight) => flight[labelField])
      categories = [...new Set(existingCategories)]

      if (displayFields == "Total Trips") {
        for (const label of categories) {
          const labelData = this.flightReport.filter((flight) => flight[labelField] == label)
          const totalTripsArray = labelData.map((flight) => flight.totalTrips)
          const sum = totalTripsArray.reduce(function (a, b) {
            return Number(a) + Number(b)
          }, 0)
          values.push(sum)
        }
      } else if (displayFields == "Total Expences") {
        for (const label of categories) {
          const labelData = this.flightReport.filter((flight) => flight[labelField] == label)
          const totalExpensesArray = labelData.map((flight) => flight.totalExpenses)
          const sum = totalExpensesArray.reduce(function (a, b) {
            return Number(a) + Number(b)
          }, 0)
          values.push(sum)
        }
      } else if (displayFields == "Total Flight Cost") {
        for (const label of categories) {
          const labelData = this.flightReport.filter((flight) => flight[labelField] == label)
          const totalFlightCostArray = labelData.map((flight) => flight.totalFlightCost)
          const sum = totalFlightCostArray.reduce(function (a, b) {
            return Number(a) + Number(b)
          }, 0)
          values.push(sum)
        }
      } else if (displayFields == "Average Duration") {
        for (const label of categories) {
          const labelData = this.flightReport.filter((flight) => flight[labelField] == label)
          const averageDurationDaysArray = labelData.map((flight) => flight.averageDurationDays)
          const sum = averageDurationDaysArray.reduce(function (a, b) {
            return Number(a) + Number(b)
          }, 0)
          values.push(sum)
        }
      }

      if (this.tabs == 0) {
        this.series = values
        this.chartOptions = { labels: categories }
      } else {
        this.series = [{ name: displayFields, data: values }]
        this.chartOptions = {
          chart: {
            height: 350,
            type: "line",
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: "straight",
          },
          title: {
            text: "",
            align: "left",
          },
          grid: {
            row: {
              colors: ["#f3f3f3", "transparent"],
              opacity: 0.5,
            },
          },
          xaxis: {
            categories: categories,
          },
        }
      }
    },
  },
}
</script>
