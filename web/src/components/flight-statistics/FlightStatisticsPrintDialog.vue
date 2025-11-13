<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="close"
    @input="closeIfFalse"
  >
    <HeaderActionsFormCard
      ref="headerActionsFormCard"
      title="Flight Statistics"
      @submit.prevent="print"
    >
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
            <b>Flight Statistics</b>
          </div>
        </v-app-bar>
        <div
          v-for="(page, index) in pages"
          :key="`pdf-page-${page}-${index}-${PDF_SCOPE_ID}`"
        >
          <v-data-table
            style="margin: 1rem 0"
            dense
            :headers="headers"
            :items="flightStatistics"
            :items-per-page="PAGE_SIZE"
            :page="page"
            class="elevation-1"
            hide-default-footer
            disable-sort
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
          <div
            v-if="page < pages.length"
            class="new-page"
          ></div>
        </div>

        <div
          style="font-size: 7pt"
          class="form-footer"
        >
          <i>Printed on: {{ currentDate }}</i>
        </div>
      </div>

      <template #actions>
        <v-btn
          color="primary"
          type="submit"
        >
          Print
          <v-icon start>mdi-printer</v-icon>
        </v-btn>
        <v-btn
          color="secondary"
          @click="close"
        >
          Close
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { uniqueId, range } from "lodash"
import { Printd } from "printd"
import { DateTime } from "luxon"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import { MAX_PER_PAGE } from "@/api/base-api"
import {
  type FlightStatisticFiltersOptions,
  type FlightStatisticWhereOptions,
} from "@/api/flight-statistics-api"
import useFlightStatistics from "@/use/use-flight-statistics"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const PDF_SCOPE_ID = uniqueId("pdf-scope-")
const PAGE_SIZE = 13

const props = withDefaults(
  defineProps<{
    where?: FlightStatisticWhereOptions
    filters?: FlightStatisticFiltersOptions
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
  }
)

const showDialog = useRouteQuery("showFlightStatisticsPrintDialog", "false", {
  transform: booleanTransformer,
})

const flightStatisticsQuery = computed(() => {
  return {
    where: props.where,
    filters: props.filters,
    perPage: MAX_PER_PAGE, // TODO: switch to back-end rendering for performance and scaling benefits
  }
})
const { flightStatistics, totalCount } = useFlightStatistics(flightStatisticsQuery, {
  skipWatchIf: () => showDialog.value !== true,
})

const pages = computed(() => range(1, Math.ceil(totalCount.value / PAGE_SIZE) + 1))

const headers = ref([
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Final Destination City",
    value: "destinationCity",
  },
  {
    text: "Final Destination Province",
    value: "destinationProvince",
  },
  {
    text: "Total Trips",
    value: "totalTrips",
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
  },
  {
    text: "Average Duration (days)",
    value: "averageDurationDays",
  },
  {
    text: "Average Expenses per Day",
    value: "averageExpensesPerDay",
  },
  {
    text: "Average Round Trip Flight Cost",
    value: "averageRoundTripFlightCost",
  },
])

const currentDate = ref("")

watch(
  () => showDialog.value,
  (newShowDialog) => {
    if (newShowDialog === true) {
      currentDate.value = DateTime.now().toFormat("MMMM d, yyyy")
    }
  },
  { immediate: true }
)

function print() {
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
    setPdfTitle(pdf)
    pdf.print(pageToPrint, styles)
    close()
  }
}

function setPdfTitle(pdf: Printd) {
  const iframe = pdf.getIFrame()

  iframe.addEventListener("load", () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document

    if (!iframeDocument) return

    const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")
    iframeDocument.title = `Report, Flight Statistics, ${timestamp}`
  })
}

function open() {
  showDialog.value = true
}

function close() {
  showDialog.value = false
}

function closeIfFalse(value: boolean) {
  if (value !== false) return

  close()
}

defineExpose({
  open,
  close,
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
