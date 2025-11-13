<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
  >
    <v-card
      v-if="!loadingData"
      class="px-10 py-5"
    >
      <v-row
        class="mb-3"
        justify="space-around"
      >
        <v-col cols="5" />
        <v-col cols="2">
          <v-btn
            color="secondary"
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
            @click="closeModal()"
            >Close</v-btn
          >
        </v-col>
      </v-row>

      <div :id="PDF_SCOPE_ID">
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
            <b>Travel Summary</b>
          </div>
        </v-app-bar>
        <div
          v-for="(page, inx) in pages"
          :key="'pdfpage-' + page + '-' + inx + '-' + PDF_SCOPE_ID"
        >
          <v-data-table
            style="margin: 1rem 0"
            dense
            :headers="headers"
            :items="printRequests"
            :items-per-page="15"
            :page="page"
            class="elevation-1"
            hide-default-footer
          >
            <template #item.destinationProvince="{ item }">
              <div class="text-center">{{ item.destinationProvince }}</div>
            </template>
            <template #item.totalTrips="{ item }">
              <div class="text-center">{{ item.totalTrips }}</div>
            </template>
            <template #item.averageDurationDays="{ item }">
              <div class="text-center">{{ item.averageDurationDays }}</div>
            </template>
            <template #item.totalExpenses="{ item }">
              {{ formatCurrency(item.totalExpenses) }}
            </template>
            <template #item.totalFlightCost="{ item }">
              {{ formatCurrency(item.totalFlightCost) }}
            </template>
            <template #item.averageExpensesPerDay="{ item }">
              {{ formatCurrency(item.averageExpensesPerDay) }}
            </template>
            <template #item.averageRoundTripFlightCost="{ item }">
              {{ formatCurrency(item.averageRoundTripFlightCost) }}
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

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { uniqueId } from "lodash"
import { Printd } from "printd"

import { FlightStatisticAsIndex } from "@/api/flight-statistics-api"
import { formatCurrency } from "@/utils/formatters"

const PDF_SCOPE_ID = uniqueId("pdf-scope-")

const props = defineProps<{
  flightReport: FlightStatisticAsIndex[]
}>()

const emit = defineEmits<{
  (event: "close"): void
}>()

const headers = [
  {
    text: "Department",
    value: "department",
    class: "m-0 p-0",
    width: "8.5rem",
  },
  {
    text: "Final Destination City",
    value: "destinationCity",
    class: "",
  },
  {
    text: "Final Destination Province",
    value: "destinationProvince",
    class: "",
  },
  {
    text: "Total Trips",
    value: "totalTrips",
    class: "",
  },
  {
    text: "Total Expenses",
    value: "totalExpenses",
    class: "m-0 p-0",
    width: "7.5rem",
  },
  {
    text: "Total Flight Cost",
    value: "totalFlightCost",
    class: "",
  },
  {
    text: "Average Duration (days)",
    value: "averageDurationDays",
    class: "",
  },
  {
    text: "Average Expenses per Day",
    value: "averageExpensesPerDay",
    class: "",
  },
  {
    text: "Average Round Trip Flight Cost",
    value: "averageRoundTripFlightCost",
    class: "",
  },
]

const showDialog = ref(false)
const printRequests = ref<FlightStatisticAsIndex[]>([])
const currentDate = ref("")
const pages = ref<number[]>([])
const loadingData = ref(false)

watch(showDialog, (newShowDialog) => {
  if (newShowDialog === true) {
    initPrint()
  }
})

async function initPrint() {
  loadingData.value = true
  currentDate.value = new Date().toDateString()

  printRequests.value = JSON.parse(JSON.stringify(props.flightReport))

  for (let index = 1; index < printRequests.value.length / 15 + 1; index++) {
    pages.value.push(index)
  }

  await nextTick()
  loadingData.value = false
}

function open() {
  showDialog.value = true
}

function closeModal() {
  emit("close")
  showDialog.value = false
}

async function print() {
  const styles = [
    /* css */ `
      @media print {
        @page {
          size: letter landscape !important;
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
        .text-center {
          text-align: center !important;
        }
      }
    `,
    `https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css`,
    /* css */ `
      thead th {
        font-size: 11pt !important;
        color: #111111 !important;
        text-align: center !important;
        border: 1px solid #333334 !important;
        border-bottom: 2px solid #333334 !important;
      }
    `,
    /* css */ `
      tbody td {
        border: 1px solid #666666 !important;
      }
    `,
    /* css */ `
      table {
        border: 2px solid #333334;
      }
    `,
  ]

  const pageToPrint = window.document.getElementById(PDF_SCOPE_ID)

  if (pageToPrint) {
    const pdf = new Printd()
    pdf.print(pageToPrint, styles)
    closeModal()
  }
}

defineExpose({
  open,
})
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
