<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="50%"
    @keydown.esc="close"
    @input="closeIfFalse"
  >
    <HeaderActionsFormCard
      title="Travel Itinerary"
      @submit.prevent="print"
    >
      <v-skeleton-loader
        v-if="isLoading"
        type="card"
      />
      <v-card
        v-else
        class="mt-10"
      >
        <v-card-title><h3>Flight Details</h3></v-card-title>
        <v-card-text>
          <div :id="'pdf-page-' + travelDeskTravelRequestId">
            <div
              v-for="(flightSegment, index) in flightSegments"
              :key="'flight-' + index"
              class="one-section"
              style="margin-top: 0.25rem"
            >
              <div
                v-if="flightSegment.ticketHeader"
                style="margin: 1rem 0 1rem 0.75rem"
              >
                <div style="line-height: 1.25rem">
                  <b>Ticket Number:</b> {{ flightSegment.ticketNumber }}
                </div>
                <div style="line-height: 1.25rem">
                  <b>Passenger Name:</b> {{ flightSegment.passengerName }}
                </div>
                <div style="line-height: 1.25rem"><b>Total Cost:</b> $ {{ totalCost }}</div>
              </div>
              <table
                style="width: 99%"
                class="mx-2 mb-7"
              >
                <tbody>
                  <tr style="line-height: 1rem">
                    <td
                      class="text-left"
                      style="width: 12%"
                    >
                      <b>Flight:</b>
                    </td>
                    <td colspan="2">{{ flightSegment.flightNumber }}</td>
                  </tr>
                  <tr style="background: #f9f9f9">
                    <td
                      class="text-left"
                      style="width: 12%"
                    >
                      <b>Departure:</b>
                    </td>
                    <td style="width: 21%">
                      {{ formatDate(flightSegment.departureInfo) }}
                    </td>
                    <td style="width: 66%">{{ flightSegment.departLocation }}</td>
                  </tr>
                  <tr style="line-height: 1rem">
                    <td
                      class="text-left"
                      style="width: 12%"
                    >
                      <b>Arrival:</b>
                    </td>
                    <td style="width: 21%">
                      {{ formatDate(flightSegment.arrivalInfo) }}
                    </td>
                    <td style="width: 66%">{{ flightSegment.arriveLocation }}</td>
                  </tr>
                  <tr style="background: #f9f9f9">
                    <td
                      class="text-left"
                      style="width: 12%"
                    >
                      <b>Class</b>
                    </td>
                    <td style="width: 21%">{{ flightSegment.classOfService }}</td>
                    <td style="width: 66%"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="margin: 1rem 0.25rem; white-space: pre">
              <p>{{ invoiceRemarks }}</p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <template #actions>
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
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
import { isNil } from "lodash"
import { Printd } from "printd"
import { DateTime } from "luxon"

import { type SegmentAsReference } from "@/api/accounts-receivable-invoices-api"
import { formatDate } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"
import useAccountsReceivableInvoices from "@/use/use-accounts-receivable-invoices"
import useAccountsReceivableInvoice from "@/use/use-accounts-receivable-invoice"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

type FlightSegment = SegmentAsReference & {
  ticketHeader: boolean
  flightNumber: string
  departLocation: string
  arriveLocation: string
  ticketNumber: string
  passengerName: string
}

const travelDeskTravelRequestId = useRouteQuery("showTravelDeskPrintItinerary", undefined, {
  transform: integerTransformer,
})

const showDialog = ref(false)

const { travelDeskTravelRequest, isLoading: isLoadingTravelDeskTravelRequest } =
  useTravelDeskTravelRequest(travelDeskTravelRequestId)

const invoiceNumber = computed(
  () => travelDeskTravelRequest.value?.passengerNameRecordDocument?.invoiceNumber ?? undefined
)

const accountsReceivableInvoicesQuery = computed(() => ({
  where: {
    invoiceNumber: invoiceNumber.value,
  },
}))
const { accountsReceivableInvoices, isLoading: isLoadingAccountsReceivableInvoices } =
  useAccountsReceivableInvoices(accountsReceivableInvoicesQuery, {
    skipWatchIf: () => isNil(invoiceNumber.value) || !showDialog.value,
  })
const accountsReceivableInvoiceId = computed(() => accountsReceivableInvoices.value[0]?.id)

const { accountsReceivableInvoice, isLoading: isLoadingAccountsReceivableInvoice } =
  useAccountsReceivableInvoice(accountsReceivableInvoiceId)

watch(
  travelDeskTravelRequestId,
  (newTravelDeskTravelRequestId) => {
    if (isNil(newTravelDeskTravelRequestId)) {
      showDialog.value = false
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const isLoading = computed(
  () =>
    isLoadingTravelDeskTravelRequest.value ||
    isLoadingAccountsReceivableInvoices.value ||
    isLoadingAccountsReceivableInvoice.value
)

const flightSegments = computed<FlightSegment[]>(() => {
  if (isNil(accountsReceivableInvoice.value)) {
    return []
  }

  const { segments, details } = accountsReceivableInvoice.value
  let ticketNumber = ""
  return segments.map((segment) => {
    const detail = details.find((d) => d.id === segment.invoiceDetailId)
    const segmentTicketNumber = detail?.ticketNumber ?? ""
    const ticketHeader = segmentTicketNumber !== ticketNumber
    if (ticketHeader) {
      ticketNumber = segmentTicketNumber
    }

    return {
      ...segment,
      ticketHeader,
      flightNumber: buildFlightNumber(segment),
      departLocation: buildLocation(segment.departureCityCode, segment.departureCityName),
      arriveLocation: buildLocation(segment.arrivalCityCode, segment.arrivalCityName),
      ticketNumber: segmentTicketNumber,
      passengerName: detail?.passengerName ?? "",
    }
  })
})

const invoiceRemarks = computed(() => accountsReceivableInvoice.value?.invoiceRemarks ?? "")

const totalCost = computed(() => accountsReceivableInvoice.value?.totalCost ?? 0)

function buildFlightNumber(segment: SegmentAsReference): string {
  const { airlineCode, flightNumber } = segment
  if (isNil(flightNumber)) {
    return airlineCode ?? ""
  }

  return `${airlineCode ?? ""}${flightNumber}`
}

function buildLocation(cityCode: string | null, cityName: string | null): string {
  const formattedCityCode = cityCode ?? ""

  if (cityName) {
    return `${cityName} (${formattedCityCode})`
  }

  return `(${formattedCityCode})`
}

function print() {
  const styles = [
    /* css */ `
      @media print {
        @page {
          size: 8.5in 11in;
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
        .one-section {
          page-break-inside: avoid;
        }
      }
    `,
    `https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css`,
    /* css */ `
      thead th {
        font-size: 11pt !important;
        color: #111111 !important;
        text-align: left !important;
        border: 1px solid #333334 !important;
        border-bottom: 2px solid #333334 !important;
      }
    `,
    /* css */ `
      tbody td {
        border: 0px solid #666666 !important;
      }
    `,
    /* css */ `
      table {
        border: 2px solid #333334;
      }
    `,
  ]

  const pdfId = "pdf-page-" + travelDeskTravelRequestId.value
  const pageToPrint = window.document.getElementById(pdfId)

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
    if (isNil(travelDeskTravelRequest.value)) return
    if (isNil(accountsReceivableInvoice.value)) return

    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDocument) return

    const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")
    const { legalLastName } = travelDeskTravelRequest.value
    const { invoiceNumber } = accountsReceivableInvoice.value

    iframeDocument.title = `Travel Itinerary, ${legalLastName} - ${invoiceNumber}, ${timestamp}`
  })
}

function open(newTravelDeskTravelRequestId: number) {
  travelDeskTravelRequestId.value = newTravelDeskTravelRequestId
}

function close() {
  travelDeskTravelRequestId.value = undefined
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) return

  close()
}

defineExpose({
  open,
})
</script>

<style scoped></style>
