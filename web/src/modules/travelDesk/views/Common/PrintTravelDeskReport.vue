<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        v-bind="{ ...attrs, ...activatorProps }"
        @click="initPrint"
        v-on="on"
      >
        Print Report
      </v-btn>
    </template>

    <v-card class="px-10 py-5">
      <v-row
        class="mb-3"
        justify="space-around"
      >
        <v-col cols="5" />
        <v-col cols="2">
          <v-btn
            color="secondary"
            :loading="isLoading"
            @click="print"
          >
            Print
            <v-icon
              class="ml-2"
              color="primary darken-2"
              >mdi-printer</v-icon
            >
          </v-btn>
        </v-col>
        <v-col cols="3" />
        <v-col
          cols="2"
          align="right"
        >
          <v-btn
            color="grey"
            @click="close"
            >Close</v-btn
          >
        </v-col>
      </v-row>

      <div id="pdf-page">
        <v-app-bar
          color="#fff"
          flat
          height="70"
          style="left: 0; border-bottom: 3px #f3b228 solid"
        >
          <img
            src="/yukon.svg"
            style="margin: -1.2rem -10rem 0 0"
            height="44"
          />
          <div style="margin: 0 auto !important; font-size: 14pt !important">
            <b>Out-of-Territory Travel Desk Report</b>
          </div>
        </v-app-bar>

        <div
          v-for="page in pages"
          :key="'pdf-page-' + page"
        >
          <v-data-table
            style="margin: 1rem 0"
            dense
            :headers="headers"
            :items="travelDeskTravelRequests"
            :loading="isLoading"
            :items-per-page="10"
            :page="page"
            class="elevation-1"
            hide-default-footer
          >
            <template #item.createdAt="{ item }">
              <div>{{ formatDate(item.createdAt) }}</div>
            </template>

            <template #item.fullname="{ item }">
              {{ item.userDisplayName }}
            </template>

            <template #item.department="{ item }">
              {{ item.department }}
            </template>

            <template #item.branch="{ item }">
              {{ item.branch }}
            </template>

            <template #item.startDate="{ item }">
              <div>{{ item.travelStartDate }}</div>
            </template>

            <template #item.endDate="{ item }">
              <div>{{ item.travelEndDate }}</div>
            </template>

            <template #item.location="{ item }">
              {{ item.locationsTraveled }}
            </template>

            <template #item.requested="{ item }">
              {{ item.requestedOptions }}
            </template>

            <template #item.status="{ item }">
              {{ determineStatus(item.status, item.travelDeskOfficer) }}
            </template>
          </v-data-table>

          <div style="font-size: 7pt; text-align: right">
            <i>Page {{ page }} of {{ pages.length }}</i>
          </div>
          <div class="new-page" />
        </div>

        <div
          style="font-size: 7pt"
          class="form-footer"
        >
          <i>Printed on: {{ currentDate }}</i>
        </div>
      </div>

      <div class="mt-10" />
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue"
import { isNil, isEmpty } from "lodash"
import { Printd } from "printd"

import { useI18n } from "@/plugins/vue-i18n-plugin"

import { formatDate } from "@/utils/formatters"

import { TRAVEL_DESK_TRAVEL_REQUEST_STATUSES } from "@/api/travel-desk-travel-requests-api"
import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

// Props
const props = defineProps({
  travelDeskTravelRequestIds: {
    type: Array,
    default: () => [],
  },
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()

const travelDeskTravelRequestsQuery = computed(() => {
  return {
    where: {
      id: props.travelDeskTravelRequestIds,
    },
  }
})
const { travelDeskTravelRequests, isLoading } = useTravelDeskTravelRequests(
  travelDeskTravelRequestsQuery,
  {
    skipWatchIf: () =>
      isNil(props.travelDeskTravelRequestIds) || isEmpty(props.travelDeskTravelRequestIds),
  }
)
const pages = computed(() => {
  const pageIndexes = []
  for (let index = 1; index < travelDeskTravelRequests.value.length / 10 + 1; index++) {
    pageIndexes.push(index)
  }

  return pageIndexes
})

const showDialog = ref(false)
const currentDate = ref("")

// Headers
const headers = [
  { text: "Submit Date", value: "createdAt", class: "m-0 p-0" },
  { text: "Name", value: "fullname", class: "m-0 p-0", sortable: false },
  { text: "Department", value: "department", class: "m-0 p-0" },
  { text: "Branch", value: "branch", class: "m-0 p-0", sortable: false },
  { text: "Travel Start Date", value: "startDate", class: "m-0 p-0" },
  { text: "Travel End Date", value: "endDate", class: "m-0 p-0", sortable: false },
  { text: "Location", value: "location", class: "m-0 p-0" },
  { text: "Requested", value: "requested", class: "m-0 p-0" },
  { text: "Status", value: "status", class: "m-0 p-0" },
  { text: "Travel Desk Officer", value: "travelDeskOfficer", class: "m-0 p-0" },
]

function initPrint() {
  currentDate.value = new Date().toLocaleString()
  showDialog.value = true
}

// TODO: move this to the back-end and use puppeteer to return a PDF as we are doing in
// https://github.com/icefoganalytics/yhsi/blob/bb4e01b180d40a4d1e0226b52d23c6e720df7714/src/api/utils/pdf-generator.ts#L2
function print() {
  const styles = [
    `@media print {
      @page {
        size: letter landscape !important;
      }
      #pdf-page {
        transform: scale(0.80); /* Adjust scale as needed */
        transform-origin: top left;
        width: 125%;
      }
      div.form-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        display: inline-block;
      }
      .new-page {
        page-break-before: always;
        position: relative;
        top: 8em;
      }
    }`,
    `https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css`,
    `thead th {
      font-size: 11pt !important;
      color: #111111 !important;
      text-align: center !important;
      border: 1px solid #333334 !important;
      border-bottom: 2px solid #333334 !important;
    }`,
    `tbody td {
      border: 1px solid #666666 !important;
    }`,
    `table {
      border: 2px solid #333334;
    }`,
  ]

  const pdf_id = "pdf-page"
  const pageToPrint = window.document.getElementById(pdf_id)

  if (pageToPrint) {
    const pdf = new Printd()
    pdf.print(pageToPrint, styles)
    close()
  }
}

function determineStatus(status, travelDeskOfficer) {
  if (
    status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.SUBMITTED &&
    (isNil(travelDeskOfficer) || isEmpty(travelDeskOfficer))
  ) {
    return "Not Started"
  }

  return t(`travel_desk_travel_request.status.${status}`, {
    $default: status,
  })
}

function close() {
  showDialog.value = false
}
</script>

<style scoped>
::v-deep(tbody td) {
  font-size: 7.5pt !important;
  border: 1px solid #666666 !important;
}

::v-deep(tbody th) {
  font-size: 7pt !important;
}

::v-deep(thead th) {
  border: 1px solid #333334 !important;
  border-bottom: 2px solid #333334 !important;
  text-align: center !important;
  font-size: 9pt !important;
  color: #111111 !important;
}

::v-deep(table) {
  border: 2px solid #333334;
}

.form-footer {
  display: none;
}
</style>
