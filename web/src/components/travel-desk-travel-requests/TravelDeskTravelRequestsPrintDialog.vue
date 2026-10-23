<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="close"
    @update:model-value="closeIfFalse"
  >
    <template #activator="{ props: dialogActivatorProps }">
      <v-btn
        v-bind="{ ...dialogActivatorProps, ...activatorProps }"
        :disabled="Boolean(activatorProps?.disabled)"
        @click="open"
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
            variant="outlined"
            :loading="isLoading"
            :disabled="!canPrint"
            @click="print"
          >
            Print
            <v-icon
              class="ml-2"
              color="primary-darken-2"
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

      <div :id="printScopeId">
        <PrintLogoHeader>Out-of-Territory Travel Desk Report</PrintLogoHeader>

        <div
          v-for="page in pages"
          :key="`${printScopeId}-page-${page}`"
        >
          <v-data-table
            style="margin: 1rem 0"
            density="compact"
            :headers="headers"
            :items="travelDeskTravelRequests"
            :loading="isLoading"
            :items-per-page="PAGE_SIZE"
            :page="page"
            class="elevation-1"
            hide-default-footer
          >
            <template #item.createdAt="{ item }">
              <div>{{ formatDate(item.createdAt) }}</div>
            </template>

            <template #item.userDisplayName="{ item }">
              {{ item.userDisplayName }}
            </template>

            <template #item.travelStartDate="{ item }">
              <div>{{ item.travelStartDate }}</div>
            </template>

            <template #item.travelEndDate="{ item }">
              <div>{{ item.travelEndDate }}</div>
            </template>

            <template #item.status="{ item }">
              {{ formatTravelDeskTravelRequestStatus(item, t) }}
            </template>
          </v-data-table>

          <div style="font-size: 7pt; text-align: right">
            <i>Page {{ page }} of {{ pages.length }}</i>
          </div>
          <div
            v-if="page < pages.length"
            class="travel-desk-report-new-page"
          />
        </div>

        <div
          style="font-size: 7pt"
          class="travel-desk-report-form-footer"
        >
          <i>Printed on: {{ currentDate }}</i>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { uniqueId } from "lodash"
import { Printd } from "printd"
import { useI18n } from "vue-i18n"

import { formatDate } from "@/utils/formatters"
import formatTravelDeskTravelRequestStatus from "@/utils/format-travel-desk-travel-request-status"

import {
  travelDeskTravelRequestsApi,
  type TravelDeskTravelRequestAsIndex,
} from "@/api/travel-desk-travel-requests-api"

import useSnack from "@/use/use-snack"

import PrintLogoHeader from "@/components/common/print/PrintLogoHeader.vue"

const PAGE_SIZE = 10
const printScopeId = uniqueId("travel-desk-report-")

const props = withDefaults(
  defineProps<{
    travelDeskTravelRequestIds: number[]
    activatorProps?: Record<string, unknown>
  }>(),
  {
    activatorProps: () => ({}),
  }
)

const { t } = useI18n()
const snack = useSnack()
const showDialog = ref(false)
const isLoading = ref(false)
const travelDeskTravelRequests = ref<TravelDeskTravelRequestAsIndex[]>([])
const currentDate = ref("")
const loadedSelectionIds = ref<number[]>([])
let loadSequence = 0

const activatorProps = computed(() => props.activatorProps)
const pages = computed(() =>
  Array.from(
    { length: Math.ceil(travelDeskTravelRequests.value.length / PAGE_SIZE) },
    (_, index) => index + 1
  )
)
const hasSelection = computed(() => props.travelDeskTravelRequestIds.length > 0)
const canPrint = computed(() => {
  const sameSelection =
    loadedSelectionIds.value.length === props.travelDeskTravelRequestIds.length &&
    loadedSelectionIds.value.every((id, index) => id === props.travelDeskTravelRequestIds[index])

  return (
    !isLoading.value &&
    hasSelection.value &&
    sameSelection &&
    travelDeskTravelRequests.value.length > 0
  )
})

const headers = [
  { title: "Submit Date", key: "createdAt", class: "m-0 p-0" },
  { title: "Name", key: "userDisplayName", class: "m-0 p-0", sortable: false },
  { title: "Department", key: "department", class: "m-0 p-0" },
  { title: "Branch", key: "branch", class: "m-0 p-0", sortable: false },
  { title: "Travel Start Date", key: "travelStartDate", class: "m-0 p-0" },
  { title: "Travel End Date", key: "travelEndDate", class: "m-0 p-0", sortable: false },
  { title: "Location", key: "locationsTraveled", class: "m-0 p-0" },
  { title: "Requested", key: "requestedOptions", class: "m-0 p-0" },
  { title: "Status", key: "status", class: "m-0 p-0" },
  { title: "Travel Desk Officer", key: "travelDeskOfficer", class: "m-0 p-0" },
]

async function open() {
  showDialog.value = true
  currentDate.value = new Date().toLocaleString()
  const selectedIds = [...props.travelDeskTravelRequestIds]
  travelDeskTravelRequests.value = []
  loadedSelectionIds.value = []
  isLoading.value = false
  const requestSequence = ++loadSequence
  if (!hasSelection.value) return

  isLoading.value = true
  try {
    const requests = await travelDeskTravelRequestsApi.listSelected(selectedIds)
    if (requestSequence !== loadSequence || !showDialog.value) return
    travelDeskTravelRequests.value = requests
    loadedSelectionIds.value = selectedIds
  } catch (error) {
    if (requestSequence !== loadSequence || !showDialog.value) return
    console.error("Unable to load selected travel desk requests for printing.", error)
    travelDeskTravelRequests.value = []
    snack.error("Unable to load the selected travel desk requests. Please try again.")
  } finally {
    if (requestSequence === loadSequence) isLoading.value = false
  }
}

function print() {
  if (!canPrint.value) return

  const styles = [
    /* css */ `
      @media print {
        @page {
          size: letter landscape !important;
        }
        div.travel-desk-report-form-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          display: inline-block;
        }
        .travel-desk-report-new-page {
          page-break-before: always;
          position: relative;
          top: 8em;
        }
        thead th {
          font-size: 9pt !important;
          color: #111111 !important;
          text-align: center !important;
          border: 1px solid #333334 !important;
          border-bottom: 2px solid #333334 !important;
        }
        tbody td {
          font-size: 7.5pt !important;
          border: 1px solid #666666 !important;
        }
        tbody th {
          font-size: 7pt !important;
        }
        table {
          border: 2px solid #333334;
        }
      }
    `,
  ]
  const pageToPrint = window.document.getElementById(printScopeId)

  if (!pageToPrint) return

  const pdf = new Printd()
  pdf.print(pageToPrint, styles)
  close()
}

function close() {
  loadSequence++
  isLoading.value = false
  travelDeskTravelRequests.value = []
  loadedSelectionIds.value = []
  showDialog.value = false
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) return

  close()
}
</script>
