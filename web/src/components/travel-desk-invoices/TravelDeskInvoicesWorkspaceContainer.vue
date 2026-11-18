<template>
  <v-container class="px-0">
    <v-alert
      v-if="!canManage"
      type="error"
      >You do not have permission to manage invoices.</v-alert
    >
    <template v-else>
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        >{{ errorMessage }}</v-alert
      >
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <h1 class="text-h5">Travel Desk Invoices</h1>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          :disabled="isSaving || isOpening || isSearching || isDeleting"
          @click="openNewInvoice"
        >
          New invoice
        </v-btn>
      </div>
      <v-progress-linear
        v-if="isLoading || isOpening"
        indeterminate
      />
      <v-btn
        v-if="errorMessage && !isLoading"
        variant="text"
        @click="loadInvoices"
        >Retry loading invoices</v-btn
      >
      <v-alert
        v-if="!isLoading && !errorMessage && invoices?.length === 0"
        type="info"
      >
        No invoices have been created for this request.
      </v-alert>
      <v-list
        v-if="invoices?.length"
        aria-label="Invoices"
      >
        <v-list-item
          v-for="value in invoices"
          :key="value.id"
          :title="value.invoiceNumber || `Invoice ${value.id}`"
          :subtitle="`${value.bookingReference} · ${value.grossAmount} ${value.currencyCode}`"
          :disabled="isSaving || isOpening || isSearching || isDeleting"
          @click="openInvoice(value.id)"
        >
          <template #append><v-icon icon="mdi-chevron-right" /></template>
        </v-list-item>
      </v-list>
      <EnhancedPagination
        v-if="!isLoading && !errorMessage && invoiceCount > invoicesPerPage"
        v-model="invoicePage"
        v-model:per-page="invoicesPerPage"
        :total-count="invoiceCount"
        :disabled="isSaving || isOpening || isSearching || isDeleting"
      />

      <v-card
        v-if="invoice && !draft && !isCreating"
        class="mt-6"
      >
        <v-card-title>{{ invoice.invoiceNumber || `Invoice ${invoice.id}` }}</v-card-title>
        <v-card-subtitle
          >{{ invoice.bookingReference }} · {{ invoice.grossAmount }}
          {{ invoice.currencyCode }}</v-card-subtitle
        >
        <v-card-text>
          <dl>
            <template
              v-for="field in headerFields"
              :key="field.key"
            >
              <dt class="font-weight-bold">{{ field.label }}</dt>
              <dd class="mb-2">{{ invoice[field.key] || "—" }}</dd>
            </template>
          </dl>
          <v-table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Segments / Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in invoice.items"
                :key="item.id"
              >
                <td>{{ t(`travel_desk_invoice_item.sale_type.${item.saleType}`) }}</td>
                <td>{{ t(`travel_desk_invoice_item.product_type.${item.productType}`) }}</td>
                <td>{{ item.vendor }}</td>
                <td>{{ item.grossAmount }} {{ invoice.currencyCode }}</td>
                <td>
                  {{ item.description }}
                  <p v-if="item.sourceAirSegmentNumber !== null">
                    {{ segmentSummary(item.sourceAirSegmentNumber) }}
                  </p>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="flex-wrap ga-2">
          <v-btn
            :disabled="isDeleting"
            @click="beginEdit"
            >Edit</v-btn
          >
          <v-btn
            color="error"
            :loading="isDeleting"
            @click="deleteInvoice"
            >Delete</v-btn
          >
          <v-btn
            :disabled="isDeleting"
            @click="closeInvoice"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>

      <v-card
        v-if="isCreating || draft"
        class="mt-6"
      >
        <v-card-title v-if="editingId !== null">Edit invoice</v-card-title>
        <v-card-title v-else>Create invoice</v-card-title>
        <v-card-text>
          <template v-if="!draft">
            <v-form @submit.prevent="searchBookings">
              <v-text-field
                v-model="bookingReference"
                label="Booking reference"
                autocomplete="off"
                maxlength="6"
                :disabled="isSearching"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="isSearching"
                >Search booking history</v-btn
              >
            </v-form>
            <v-alert
              v-if="hasSearched && !isSearching && !errorMessage && bookingEventCount === 0"
              type="info"
              class="mt-4"
            >
              No booking events were found for this booking reference.
            </v-alert>
            <v-alert
              v-if="hasSearched && bookingEvents.length > 0 && flightBookingEvents.length === 0"
              type="warning"
              class="mt-4"
            >
              This page has no flight booking event. Browse other pages to choose a booking.
            </v-alert>
            <EnhancedPagination
              v-if="hasSearched && bookingEventCount > bookingsPerPage"
              v-model="bookingPage"
              v-model:per-page="bookingsPerPage"
              :total-count="bookingEventCount"
              :disabled="isSearching"
            />
            <v-btn
              v-if="hasSearched && errorMessage"
              variant="text"
              :loading="isSearching"
              @click="loadBookingPage"
              >Retry loading booking history</v-btn
            >
            <template v-if="hasSearched && bookingEventCount > 0 && !isSearching">
              <v-alert
                type="info"
                class="my-4"
              >
                Select the intended booking event. Event order and version numbers do not
                identify a current booking automatically.
              </v-alert>
              <v-radio-group
                v-if="flightBookingEvents.length"
                :model-value="selectedBookingEvent?.travelOrderIdentifier ?? null"
                label="Choose one flight booking event on this page"
                @update:model-value="selectBookingEvent"
              >
                <v-radio
                  v-for="event in flightBookingEvents"
                  :key="event.travelOrderIdentifier"
                  :value="event.travelOrderIdentifier"
                  :label="eventSummary(event)"
                />
              </v-radio-group>
              <h2 class="text-h6">Service-fee events (optional)</h2>
              <p>
                Choose only the fee records to include. Historical versions of one document must not
                be charged twice.
              </p>
              <v-checkbox
                v-for="event in feeEvents"
                :key="event.travelOrderIdentifier"
                :model-value="
                  selectedFeeEvents.some(
                    (selected) => selected.travelOrderIdentifier === event.travelOrderIdentifier
                  )
                "
                :label="feeSummary(event)"
                @update:model-value="selectFeeEvent(event, $event)"
              />
              <p
                v-if="feeEvents.length === 0"
                class="my-3"
              >
                No service fees are present on this page.
              </p>
              <h2 class="text-h6 mt-4">Selected across all pages</h2>
              <p v-if="selectedBookingEvent">{{ eventSummary(selectedBookingEvent) }}</p>
              <p v-else>No flight booking event selected.</p>
              <v-checkbox
                v-for="event in selectedFeeEvents"
                :key="event.travelOrderIdentifier"
                :model-value="true"
                :label="feeSummary(event)"
                @update:model-value="selectFeeEvent(event, $event)"
              />
              <p v-if="selectedFeeEvents.length === 0">No service-fee events selected.</p>
              <v-btn
                color="primary"
                :disabled="selectedBookingEvent === null"
                @click="startDraft"
                >Use selected booking</v-btn
              >
            </template>
          </template>
          <template v-else>
            <p class="mb-4">
              Booking reference: <strong>{{ draft.bookingReference }}</strong> · Source event
              {{ draft.externalBookingEventIdentifier }}
            </p>
            <v-row>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="draft.currencyCode"
                  label="Currency code"
                  maxlength="3"
                  :disabled="isSaving"
                  hint="All amounts use this currency; no conversion is performed."
                  persistent-hint
                />
              </v-col>
              <v-col
                v-for="field in headerFields"
                :key="field.key"
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="draft[field.key]"
                  :label="field.label"
                  :type="field.type"
                  :disabled="isSaving"
                />
              </v-col>
            </v-row>
            <h2 class="text-h6 my-4">Invoice items</h2>
            <p class="mb-3">
              Enter prices for the selected flight segments. Credits use Refund; Void rows do not
              contribute to the total.
            </p>
            <TravelDeskInvoiceItemEditCard
              v-for="(item, index) in draft.items"
              :key="index"
              v-model="draft.items[index]"
              :local-segments="localSegments"
              :passenger-names="passengerNames"
              :source-segment-description="
                item.sourceAirSegmentNumber === null
                  ? null
                  : segmentSummary(item.sourceAirSegmentNumber)
              "
              :is-saving="isSaving"
              class="mb-3"
              @removed="removeCharge(index)"
            />
            <v-btn
              variant="outlined"
              prepend-icon="mdi-plus"
              :disabled="isSaving"
              @click="addCharge"
              >Add extra charge</v-btn
            >
            <p
              v-if="computedTotal !== null"
              class="text-h6 mt-4"
            >
              Total: {{ computedTotal }} {{ draft.currencyCode }}
            </p>
            <p
              v-else
              class="mt-4"
            >
              Total: enter valid amounts within the supported range. Each line is rounded to three
              decimal places.
            </p>
          </template>
        </v-card-text>
        <v-card-actions class="flex-wrap ga-2">
          <v-btn
            v-if="draft"
            color="primary"
            :loading="isSaving"
            @click="saveInvoice"
            >Save invoice</v-btn
          >
          <v-btn
            :disabled="isSaving || isSearching"
            @click="closeEditor"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { isCancel } from "axios"
import { cloneDeep, isNil } from "lodash"

import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"

import ApiError from "@/api/api-error"
import {
  type TravelDeskFlightSegmentAsIndex,
  travelDeskFlightSegmentsApi,
} from "@/api/travel-desk-flight-segments-api"
import {
  type InvoiceInput,
  type InvoiceItemInput,
  type InvoiceUpdateInput,
  type TravelDeskInvoiceAsShow,
  TravelDeskInvoiceItemProductTypes,
  TravelDeskInvoiceItemSaleTypes,
  travelDeskInvoicesApi,
} from "@/api/travel-desk-invoices-api"
import {
  type TravelDeskBookingEventAsIndex,
  travelDeskBookingEventsApi,
} from "@/api/travel-desk-booking-events-api"

import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

import EnhancedPagination from "@/components/common/EnhancedPagination.vue"

import TravelDeskInvoiceItemEditCard from "@/components/travel-desk-invoices/TravelDeskInvoiceItemEditCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const requestId = computed(() => Number(props.travelDeskTravelRequestId))
const { isAdmin, isTravelDeskUser } = useCurrentUser()
const canManage = computed(() => Boolean(isAdmin.value || isTravelDeskUser.value))
const snack = useSnack()
const { t } = useI18n()
const invoices = ref<TravelDeskInvoiceAsShow[] | null>(null)
const invoice = ref<TravelDeskInvoiceAsShow | null>(null)
const localSegments = ref<TravelDeskFlightSegmentAsIndex[]>([])
const bookingEvents = ref<TravelDeskBookingEventAsIndex[]>([])
const draft = ref<InvoiceInput | null>(null)
const editingId = ref<number | null>(null)
const isCreating = ref(false)
const isLoading = computed(() => isNil(invoices.value))
const isOpening = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isSearching = ref(false)
const hasSearched = ref(false)
const errorMessage = ref("")
const bookingReference = ref("")
const searchedBookingReference = ref("")
const selectedBookingEvent = ref<TravelDeskBookingEventAsIndex | null>(null)
const selectedFeeEvents = ref<TravelDeskBookingEventAsIndex[]>([])
const { page: bookingPage, perPage: bookingsPerPage } = useRouteQueryPagination({
  routeQuerySuffix: "TravelDeskInvoiceBookingEvents",
})
const bookingEventCount = ref(0)
let bookingRequestController: AbortController | null = null
const { page: invoicePage, perPage: invoicesPerPage } = useRouteQueryPagination({
  routeQuerySuffix: "TravelDeskInvoices",
})
const invoiceCount = ref(0)
let contextVersion = 0
const AMOUNT_PATTERN = /^-?\d+(?:\.\d+)?$/
const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n
const flightBookingEvents = computed(() =>
  bookingEvents.value.filter((event) => event.airReservationSegments.length > 0)
)
const feeEvents = computed(() =>
  bookingEvents.value.filter((event) => event.serviceFeeTransaction !== null)
)
const passengerNames = computed(() => {
  if (selectedBookingEvent.value) {
    return selectedBookingEvent.value.passengers.map((passenger) =>
      [passenger.firstName, passenger.lastName].filter(Boolean).join(" ")
    )
  }

  return [
    ...new Set(
      (invoice.value?.items ?? []).flatMap((item) =>
        item.passengerName ? [item.passengerName] : []
      )
    ),
  ]
})

type InvoiceHeaderKey = keyof Omit<InvoiceUpdateInput, "items" | "currencyCode">

const headerFields: { key: InvoiceHeaderKey; label: string; type: string }[] = [
  { key: "invoiceNumber", label: "Invoice number", type: "text" },
  { key: "invoiceDate", label: "Invoice date", type: "date" },
  { key: "warrantNumber", label: "Warrant number", type: "text" },
  { key: "clientNumber", label: "Client number", type: "text" },
  { key: "clientName", label: "Client name", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "mailcode", label: "Mailcode", type: "text" },
  { key: "iataNumber", label: "IATA number", type: "text" },
  { key: "bookingAgentName", label: "Booking agent", type: "text" },
  { key: "ticketingAgentName", label: "Ticketing agent", type: "text" },
  { key: "bookingDate", label: "Booking date", type: "date" },
]

function errorText(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message

  return fallback
}

async function loadInvoices() {
  const version = contextVersion
  const requestedPage = invoicePage.value
  const requestedPerPage = invoicesPerPage.value
  invoices.value = null
  errorMessage.value = ""
  try {
    const { travelDeskInvoices, totalCount } = await travelDeskInvoicesApi.list(requestId.value, {
      page: requestedPage,
      perPage: requestedPerPage,
    })
    if (
      version !== contextVersion ||
      requestedPage !== invoicePage.value ||
      requestedPerPage !== invoicesPerPage.value
    ) {
      return
    }

    const lastPage = Math.max(1, Math.ceil(totalCount / requestedPerPage))
    if (requestedPage > lastPage) {
      invoicePage.value = lastPage
      return
    }

    invoices.value = travelDeskInvoices
    invoiceCount.value = totalCount
  } catch (error) {
    if (
      version !== contextVersion ||
      requestedPage !== invoicePage.value ||
      requestedPerPage !== invoicesPerPage.value
    ) {
      return
    }

    console.error("Failed to load travel desk invoices", error)
    errorMessage.value = errorText(error, "Invoices could not be loaded.")
  } finally {
    if (
      version === contextVersion &&
      requestedPage === invoicePage.value &&
      requestedPerPage === invoicesPerPage.value &&
      isNil(invoices.value)
    ) {
      invoices.value = []
    }
  }
}

function closeEditor() {
  draft.value = null
  editingId.value = null
  isCreating.value = false
  bookingRequestController?.abort()
  bookingEvents.value = []
  bookingEventCount.value = 0
  selectedBookingEvent.value = null
  selectedFeeEvents.value = []
  hasSearched.value = false
  isSearching.value = false
  errorMessage.value = ""
}

function closeInvoice() {
  invoice.value = null
}

function openNewInvoice() {
  closeEditor()
  closeInvoice()
  localSegments.value = []
  bookingReference.value = ""
  searchedBookingReference.value = ""
  isCreating.value = true
}

async function openInvoice(id: number) {
  const version = contextVersion
  isOpening.value = true
  closeEditor()
  try {
    const [result, localResult] = await Promise.all([
      travelDeskInvoicesApi.get(requestId.value, id),
      travelDeskFlightSegmentsApi.list({
        filters: { forTravelRequest: requestId.value },
        perPage: -1,
      }),
    ])
    if (version !== contextVersion) return

    invoice.value = result.travelDeskInvoice
    localSegments.value = localResult.travelDeskFlightSegments
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to open travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be opened.")
  } finally {
    if (version === contextVersion) isOpening.value = false
  }
}

async function loadBookingPage() {
  bookingRequestController?.abort()
  const controller = new AbortController()
  bookingRequestController = controller
  isSearching.value = true
  errorMessage.value = ""
  bookingEvents.value = []
  try {
    const { travelDeskBookingEvents, totalCount } = await travelDeskBookingEventsApi.list(
      requestId.value,
      {
        where: {
          bookingReference: searchedBookingReference.value,
        },
        page: bookingPage.value,
        perPage: bookingsPerPage.value,
      },
      { signal: controller.signal }
    )
    if (controller.signal.aborted) return

    const lastPage = Math.max(1, Math.ceil(totalCount / bookingsPerPage.value))
    if (bookingPage.value > lastPage) {
      bookingPage.value = lastPage
      return
    }

    bookingEvents.value = travelDeskBookingEvents
    bookingEventCount.value = totalCount
  } catch (error) {
    if (isCancel(error) || controller.signal.aborted) return

    console.error("Failed to load invoice booking history", error)
    errorMessage.value = errorText(error, "Booking history could not be loaded.")
  } finally {
    if (bookingRequestController === controller) isSearching.value = false
  }
}

async function searchBookings() {
  bookingRequestController?.abort()
  const controller = new AbortController()
  bookingRequestController = controller
  const version = contextVersion
  isSearching.value = true
  errorMessage.value = ""
  bookingEvents.value = []
  bookingEventCount.value = 0
  selectedBookingEvent.value = null
  selectedFeeEvents.value = []
  hasSearched.value = false
  bookingPage.value = 1
  try {
    const normalizedBookingReference = bookingReference.value.trim().toUpperCase()
    const [, localResult] = await Promise.all([
      travelDeskBookingEventsApi.sync(
        requestId.value,
        { bookingReference: normalizedBookingReference },
        { signal: controller.signal }
      ),
      travelDeskFlightSegmentsApi.list({
        filters: { forTravelRequest: requestId.value },
        perPage: -1,
      }),
    ])
    if (version !== contextVersion || controller.signal.aborted) return

    localSegments.value = localResult.travelDeskFlightSegments
    searchedBookingReference.value = normalizedBookingReference
    hasSearched.value = true
    await loadBookingPage()
  } catch (error) {
    if (version !== contextVersion || isCancel(error) || controller.signal.aborted) return

    console.error("Failed to search invoice bookings", error)
    errorMessage.value = errorText(error, "Booking history could not be loaded.")
  } finally {
    if (bookingRequestController === controller) isSearching.value = false
  }
}

function selectBookingEvent(identifier: number | null) {
  selectedBookingEvent.value =
    flightBookingEvents.value.find((event) => event.travelOrderIdentifier === identifier) ?? null
}

function selectFeeEvent(event: TravelDeskBookingEventAsIndex, selected: boolean | null) {
  selectedFeeEvents.value = selectedFeeEvents.value.filter(
    (candidate) => candidate.travelOrderIdentifier !== event.travelOrderIdentifier
  )
  if (selected) selectedFeeEvents.value.push(event)
}

function eventSummary(event: TravelDeskBookingEventAsIndex) {
  return `Event ${event.travelOrderIdentifier} · ${event.eventType ?? "unknown type"} · version ${event.bookingFileVersionNumber ?? "—"} · ${event.owningAgencyName ?? event.transactionAgencyName ?? "agency unavailable"} · ${event.externalCreatedAt}`
}

function feeSummary(event: TravelDeskBookingEventAsIndex) {
  const fee = event.serviceFeeTransaction
  if (!fee) return eventSummary(event)

  return `${eventSummary(event)} · document ${fee.serviceFeeDocumentNumber ?? "unavailable"} · status ${fee.activeVoidStatus ?? "unknown"} · ${fee.serviceFeeAmount ?? "amount unavailable"} ${fee.currencyCode ?? "currency unavailable"}`
}

function segmentSummary(segmentNumber: number) {
  const segment = selectedBookingEvent.value?.airReservationSegments.find(
    (candidate) => candidate.airSegmentNumber === segmentNumber
  )
  if (!segment) return `Source segment ${segmentNumber}`

  return `${segment.carrierCode ?? ""}${segment.flightNumber ?? ""} · ${segment.boardPoint ?? ""} → ${segment.offPoint ?? ""} · ${segment.departureDate ?? "date unavailable"} ${segment.departureTime ?? ""} · status ${segment.segmentStatus ?? "unknown"}`
}

function startDraft() {
  const event = selectedBookingEvent.value
  if (!event) {
    errorMessage.value = "Choose a flight booking event first."
    return
  }

  const selectedFees = selectedFeeEvents.value
  const currencies = new Set<string>()
  for (const selectedFee of selectedFees) {
    const currency = selectedFee.serviceFeeTransaction?.currencyCode
    if (currency) currencies.add(currency)
  }

  if (currencies.size > 1) {
    errorMessage.value =
      "Selected service fees use different currencies. Select fees in one currency."
    return
  }

  let passengerName: string | null = null
  if (event.passengers.length === 1) {
    const passenger = event.passengers[0]
    passengerName = [passenger.firstName, passenger.lastName].filter(Boolean).join(" ")
  }
  const items: InvoiceItemInput[] = event.airReservationSegments.map((segment, index) => ({
    productType: TravelDeskInvoiceItemProductTypes.AIR,
    travelDeskFlightSegmentId: null,
    sourceAirSegmentNumber: segment.airSegmentNumber,
    sourceServiceFeeEventExternalIdentifier: null,
    passengerName,
    ticketNumber: null,
    vendor: segment.carrierCode,
    description: [segment.carrierCode, segment.flightNumber, segment.boardPoint, segment.offPoint]
      .filter(Boolean)
      .join(" "),
    saleType: TravelDeskInvoiceItemSaleTypes.SALE,
    grossAmount: "",
    position: index,
  }))
  for (const feeEvent of selectedFees) {
    const fee = feeEvent.serviceFeeTransaction
    if (!fee) continue

    let saleType = TravelDeskInvoiceItemSaleTypes.SALE
    if (fee.activeVoidStatus === "V") saleType = TravelDeskInvoiceItemSaleTypes.VOID

    items.push({
      productType: TravelDeskInvoiceItemProductTypes.SERVICE_FEE,
      travelDeskFlightSegmentId: null,
      sourceAirSegmentNumber: null,
      sourceServiceFeeEventExternalIdentifier: feeEvent.travelOrderIdentifier,
      passengerName: fee.nameOnServiceFee,
      ticketNumber: fee.relatedTicketDocumentNumber,
      vendor: feeEvent.transactionAgencyName ?? feeEvent.owningAgencyName,
      description: `Service fee ${fee.serviceFeeDocumentNumber ?? ""}`.trim(),
      saleType,
      grossAmount: fee.serviceFeeAmount ?? "",
      position: items.length,
    })
  }
  draft.value = {
    bookingReference: searchedBookingReference.value,
    externalBookingEventIdentifier: event.travelOrderIdentifier,
    sourceServiceFeeEventExternalIdentifiers: selectedFees.map(
      (event) => event.travelOrderIdentifier
    ),
    currencyCode: [...currencies][0] ?? "",
    invoiceNumber: null,
    invoiceDate: null,
    warrantNumber: null,
    clientNumber: null,
    clientName: null,
    department: null,
    mailcode: null,
    iataNumber: event.creatingAgencyInternationalAirTransportAssociationNumber,
    bookingAgentName: event.transactionAgent,
    ticketingAgentName: null,
    bookingDate: event.passengerNameRecordCreatedAt?.slice(0, 10) ?? null,
    items,
  }
  errorMessage.value = ""
}

function beginEdit() {
  if (!invoice.value) return

  const savedInvoice = invoice.value
  editingId.value = savedInvoice.id
  draft.value = {
    bookingReference: savedInvoice.bookingReference,
    externalBookingEventIdentifier: savedInvoice.externalBookingEventIdentifier,
    sourceServiceFeeEventExternalIdentifiers: savedInvoice.items.flatMap((item) =>
      item.sourceServiceFeeEventExternalIdentifier === null
        ? []
        : [item.sourceServiceFeeEventExternalIdentifier]
    ),
    currencyCode: savedInvoice.currencyCode,
    invoiceNumber: savedInvoice.invoiceNumber,
    invoiceDate: savedInvoice.invoiceDate,
    warrantNumber: savedInvoice.warrantNumber,
    clientNumber: savedInvoice.clientNumber,
    clientName: savedInvoice.clientName,
    department: savedInvoice.department,
    mailcode: savedInvoice.mailcode,
    iataNumber: savedInvoice.iataNumber,
    bookingAgentName: savedInvoice.bookingAgentName,
    ticketingAgentName: savedInvoice.ticketingAgentName,
    bookingDate: savedInvoice.bookingDate,
    items: cloneDeep(savedInvoice.items),
  }
}

function addCharge() {
  if (!draft.value) return

  draft.value.items.push({
    productType: TravelDeskInvoiceItemProductTypes.CHANGE_FEE,
    travelDeskFlightSegmentId: null,
    sourceAirSegmentNumber: null,
    sourceServiceFeeEventExternalIdentifier: null,
    passengerName: null,
    ticketNumber: null,
    vendor: null,
    description: null,
    saleType: TravelDeskInvoiceItemSaleTypes.SALE,
    grossAmount: "",
    position: draft.value.items.length,
  })
}

function removeCharge(index: number) {
  if (!draft.value) return

  draft.value.items.splice(index, 1)
  draft.value.items.forEach((item, position) => {
    item.position = position
  })
}

const computedTotal = computed(() => {
  if (!draft.value) return null

  let total = 0n
  for (const item of draft.value.items) {
    if (!AMOUNT_PATTERN.test(item.grossAmount)) return null

    const [whole, fraction = ""] = item.grossAmount.replace("-", "").split(".")
    const thousandths = fraction.slice(0, 3).padEnd(3, "0")
    let amount = BigInt(whole) * 1000n + BigInt(thousandths)
    if (fraction.length > 3 && fraction[3] >= "5") amount += 1n
    if (amount > MAX_AMOUNT_THOUSANDTHS) return null
    if (item.grossAmount.startsWith("-")) amount = -amount

    if (item.saleType === TravelDeskInvoiceItemSaleTypes.SALE) total += amount
    if (item.saleType === TravelDeskInvoiceItemSaleTypes.REFUND) {
      if (amount < 0n) amount = -amount

      total -= amount
    }
  }

  if (total > MAX_AMOUNT_THOUSANDTHS || total < -MAX_AMOUNT_THOUSANDTHS) return null

  let sign = ""
  if (total < 0n) sign = "-"

  let absolute = total
  if (absolute < 0n) absolute = -absolute

  return `${sign}${absolute / 1000n}.${String(absolute % 1000n).padStart(3, "0")}`
})

async function saveInvoice() {
  const version = contextVersion
  if (!draft.value) return

  if (!computedTotal.value || !/^[A-Z]{3}$/.test(draft.value.currencyCode)) {
    errorMessage.value =
      "Enter valid amounts, a supported total, and a three-letter uppercase currency code."
    return
  }
  isSaving.value = true
  errorMessage.value = ""
  try {
    let result
    if (editingId.value !== null) {
      const updates: InvoiceUpdateInput = {
        currencyCode: draft.value.currencyCode,
        invoiceNumber: draft.value.invoiceNumber,
        invoiceDate: draft.value.invoiceDate,
        warrantNumber: draft.value.warrantNumber,
        clientNumber: draft.value.clientNumber,
        clientName: draft.value.clientName,
        department: draft.value.department,
        mailcode: draft.value.mailcode,
        iataNumber: draft.value.iataNumber,
        bookingAgentName: draft.value.bookingAgentName,
        ticketingAgentName: draft.value.ticketingAgentName,
        bookingDate: draft.value.bookingDate,
        items: draft.value.items,
      }
      result = await travelDeskInvoicesApi.update(requestId.value, editingId.value, updates)
    } else {
      result = await travelDeskInvoicesApi.create(requestId.value, draft.value)
    }
    if (version !== contextVersion) return

    closeEditor()
    invoice.value = result.travelDeskInvoice
    await loadInvoices()
    snack.success("Invoice saved")
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to save travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be saved.")
  } finally {
    if (version === contextVersion) isSaving.value = false
  }
}

async function deleteInvoice() {
  const version = contextVersion
  if (!invoice.value || !window.confirm("Delete this invoice?")) return

  isDeleting.value = true
  try {
    await travelDeskInvoicesApi.delete(requestId.value, invoice.value.id)
    if (version !== contextVersion) return

    invoice.value = null
    await loadInvoices()
    snack.success("Invoice deleted")
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to delete travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be deleted.")
  } finally {
    if (version === contextVersion) isDeleting.value = false
  }
}

watch(
  [requestId, canManage],
  async () => {
    contextVersion += 1
    isOpening.value = false
    isSaving.value = false
    isDeleting.value = false
    isSearching.value = false
    closeEditor()
    invoice.value = null
    invoices.value = []

    if (!canManage.value) return

    if (!Number.isInteger(requestId.value) || requestId.value <= 0) {
      errorMessage.value = "Invalid travel request."
      return
    }

    await loadInvoices()
  },
  { immediate: true }
)

watch([invoicePage, invoicesPerPage], () => {
  if (canManage.value && Number.isInteger(requestId.value) && requestId.value > 0) {
    loadInvoices()
  }
})

watch([bookingPage, bookingsPerPage], () => {
  if (hasSearched.value && isCreating.value && !draft.value) loadBookingPage()
})

onScopeDispose(() => {
  bookingRequestController?.abort()
})
</script>

<style scoped>
.max-w-full {
  max-width: 100%;
}
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
