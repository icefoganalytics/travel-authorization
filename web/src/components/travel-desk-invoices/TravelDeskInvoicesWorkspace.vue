<script lang="ts">
export type TravelDeskInvoicesWorkspaceProps = {
  travelDeskTravelRequestId: string
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { cloneDeep } from "lodash"

import ApiError from "@/api/api-error"
import {
  type InvoiceBookingEvent,
  type InvoiceInput,
  type InvoiceItemInput,
  type InvoiceLocalFlightSegment,
  type InvoiceSourceSnapshot,
  type InvoiceUpdateInput,
  type TravelDeskInvoice,
  travelDeskInvoicesApi,
} from "@/api/travel-desk-invoices-api"
import {
  type TravelDeskProductType,
  travelDeskProductTypesApi,
} from "@/api/travel-desk-product-types-api"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

const props = defineProps<TravelDeskInvoicesWorkspaceProps>()
const requestId = computed(() => Number(props.travelDeskTravelRequestId))
const { isAdmin, isTravelDeskUser } = useCurrentUser()
const canManage = computed(() => Boolean(isAdmin.value || isTravelDeskUser.value))
const snack = useSnack()
const invoices = ref<TravelDeskInvoice[]>([])
const invoice = ref<TravelDeskInvoice | null>(null)
const productTypes = ref<TravelDeskProductType[]>([])
const localSegments = ref<InvoiceLocalFlightSegment[]>([])
const bookingEvents = ref<InvoiceBookingEvent[]>([])
const snapshot = ref<InvoiceSourceSnapshot | null>(null)
const draft = ref<InvoiceInput | null>(null)
const editingId = ref<number | null>(null)
const isCreating = ref(false)
const loading = ref(false)
const opening = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchBusy = ref(false)
const hasSearched = ref(false)
const errorMessage = ref("")
const productTypesError = ref("")
const recordLocator = ref("")
const searchedRecordLocator = ref("")
const selectedBookingEventId = ref<number | null>(null)
const selectedFeeEventIds = ref<number[]>([])
const invoicePage = ref(1)
const invoiceCount = ref(0)
let contextVersion = 0
const INVOICES_PER_PAGE = 10
const AMOUNT_PATTERN = /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,3})?$/
const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n
const totalPages = computed(() => Math.ceil(invoiceCount.value / INVOICES_PER_PAGE))
const flightBookingEvents = computed(() =>
  bookingEvents.value.filter((event) => event.airReservationSegments.length > 0)
)
const feeEvents = computed(() =>
  bookingEvents.value.filter((event) => event.serviceFeeTransaction !== null)
)
const passengerNames = computed(() => {
  if (!snapshot.value) return []

  return snapshot.value.bookingEvent.passengers.map((passenger) =>
    [passenger.firstName, passenger.lastName].filter(Boolean).join(" ")
  )
})

type HeaderKey = keyof Omit<InvoiceUpdateInput, "items" | "currencyCode">
const headerFields: { key: HeaderKey; label: string; type: string }[] = [
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
  loading.value = true
  errorMessage.value = ""
  try {
    const result = await travelDeskInvoicesApi.list({
      where: { travelDeskTravelRequestId: requestId.value },
      page: invoicePage.value,
      perPage: INVOICES_PER_PAGE,
    })
    if (version !== contextVersion || requestedPage !== invoicePage.value) return

    const lastPage = Math.max(1, Math.ceil(result.totalCount / INVOICES_PER_PAGE))
    if (requestedPage > lastPage) {
      invoicePage.value = lastPage
      await loadInvoices()
      return
    }

    invoices.value = result.travelDeskInvoices
    invoiceCount.value = result.totalCount
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to load travel desk invoices", error)
    errorMessage.value = errorText(error, "Invoices could not be loaded.")
  } finally {
    if (version === contextVersion && requestedPage === invoicePage.value) loading.value = false
  }
}

async function loadProductTypes() {
  const version = contextVersion
  productTypesError.value = ""
  try {
    const result = await travelDeskProductTypesApi.list({ perPage: 1000 })
    if (version !== contextVersion) return

    productTypes.value = result.travelDeskProductTypes
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to load invoice product types", error)
    productTypesError.value = errorText(error, "Invoice product types could not be loaded.")
  }
}

function closeEditor() {
  draft.value = null
  editingId.value = null
  isCreating.value = false
  bookingEvents.value = []
  selectedBookingEventId.value = null
  selectedFeeEventIds.value = []
  hasSearched.value = false
  errorMessage.value = ""
  snapshot.value = invoice.value?.sourceSnapshot ?? null
}

function closeInvoice() {
  invoice.value = null
  snapshot.value = null
}

function openNewInvoice() {
  closeEditor()
  closeInvoice()
  localSegments.value = []
  recordLocator.value = ""
  searchedRecordLocator.value = ""
  isCreating.value = true
}

async function openInvoice(id: number) {
  const version = contextVersion
  opening.value = true
  closeEditor()
  try {
    const [result, localResult] = await Promise.all([
      travelDeskInvoicesApi.get(id),
      travelDeskInvoicesApi.bookingEvents(requestId.value),
    ])
    if (version !== contextVersion) return

    invoice.value = result.travelDeskInvoice
    snapshot.value = result.travelDeskInvoice.sourceSnapshot
    localSegments.value = localResult.flightSegments
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to open travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be opened.")
  } finally {
    if (version === contextVersion) opening.value = false
  }
}

async function searchBookings() {
  const version = contextVersion
  searchBusy.value = true
  errorMessage.value = ""
  bookingEvents.value = []
  selectedBookingEventId.value = null
  selectedFeeEventIds.value = []
  hasSearched.value = false
  try {
    const locator = recordLocator.value.trim().toUpperCase()
    const result = await travelDeskInvoicesApi.bookingEvents(requestId.value, locator)
    if (version !== contextVersion) return

    bookingEvents.value = result.bookingEvents
    localSegments.value = result.flightSegments
    searchedRecordLocator.value = locator
    hasSearched.value = true
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to search invoice bookings", error)
    errorMessage.value = errorText(error, "Booking history could not be loaded.")
  } finally {
    if (version === contextVersion) searchBusy.value = false
  }
}

function eventSummary(event: InvoiceBookingEvent) {
  return `Event ${event.travelOrderIdentifier} · ${event.eventType ?? "unknown type"} · version ${event.bookingFileVersionNumber ?? "—"} · ${event.owningAgencyName ?? event.transactionAgencyName ?? "agency unavailable"} · ${event.databaseTimestamp}`
}

function feeSummary(event: InvoiceBookingEvent) {
  const fee = event.serviceFeeTransaction
  if (!fee) return eventSummary(event)

  return `${eventSummary(event)} · document ${fee.serviceFeeDocumentNumber ?? "unavailable"} · status ${fee.activeVoidStatus ?? "unknown"} · ${fee.serviceFeeAmount ?? "amount unavailable"} ${fee.currencyCode ?? "currency unavailable"}`
}

function segmentSummary(segmentNumber: number) {
  const segment = snapshot.value?.bookingEvent.airReservationSegments.find(
    (candidate) => candidate.airSegmentNumber === segmentNumber
  )
  if (!segment) return `Source segment ${segmentNumber}`

  return `${segment.carrierCode ?? ""}${segment.flightNumber ?? ""} · ${segment.boardPoint ?? ""} → ${segment.offPoint ?? ""} · ${segment.departureDate ?? "date unavailable"} ${segment.departureTime ?? ""} · status ${segment.segmentStatus ?? "unknown"}`
}

function localSegmentSummary(segment: InvoiceLocalFlightSegment) {
  return `${segment.flightNumber ?? "Flight"} · ${segment.departLocation ?? ""} → ${segment.arriveLocation ?? ""} · ${segment.departAt ?? "date unavailable"}`
}

function startDraft() {
  const event = bookingEvents.value.find(
    (candidate) => candidate.travelOrderIdentifier === selectedBookingEventId.value
  )
  const airType = productTypes.value.find((product) => product.code === "air")
  const feeType = productTypes.value.find((product) => product.code === "service-fee")
  if (!event || !airType || !feeType) {
    errorMessage.value = "Choose a flight booking event and load the invoice product types first."
    return
  }

  const selectedFees = feeEvents.value.filter((candidate) =>
    selectedFeeEventIds.value.includes(candidate.travelOrderIdentifier)
  )
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

  snapshot.value = cloneDeep({ bookingEvent: event, serviceFeeEvents: selectedFees })
  let passengerName: string | null = null
  if (event.passengers.length === 1) {
    passengerName = [event.passengers[0].firstName, event.passengers[0].lastName]
      .filter(Boolean)
      .join(" ")
  }
  const items: InvoiceItemInput[] = event.airReservationSegments.map((segment, index) => ({
    travelDeskProductTypeId: airType.id,
    travelDeskFlightSegmentId: null,
    sourceAirSegmentNumber: segment.airSegmentNumber,
    sourceServiceFeeEventId: null,
    passengerName,
    ticketNumber: null,
    vendor: segment.carrierCode,
    description: [segment.carrierCode, segment.flightNumber, segment.boardPoint, segment.offPoint]
      .filter(Boolean)
      .join(" "),
    saleType: "Sale",
    grossAmount: "",
    position: index,
  }))
  for (const feeEvent of selectedFees) {
    const fee = feeEvent.serviceFeeTransaction
    if (!fee) continue

    let saleType: InvoiceItemInput["saleType"] = "Sale"
    if (fee.activeVoidStatus === "V") saleType = "Void"

    items.push({
      travelDeskProductTypeId: feeType.id,
      travelDeskFlightSegmentId: null,
      sourceAirSegmentNumber: null,
      sourceServiceFeeEventId: feeEvent.travelOrderIdentifier,
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
    travelDeskTravelRequestId: requestId.value,
    recordLocator: searchedRecordLocator.value,
    sourceBookingEventId: event.travelOrderIdentifier,
    sourceServiceFeeEventIds: [...selectedFeeEventIds.value],
    currencyCode: [...currencies][0] ?? "",
    invoiceNumber: null,
    invoiceDate: null,
    warrantNumber: null,
    clientNumber: null,
    clientName: null,
    department: null,
    mailcode: null,
    iataNumber: event.creatingAgencyIata,
    bookingAgentName: event.transactionAgent,
    ticketingAgentName: null,
    bookingDate: event.pnrCreationDate?.slice(0, 10) ?? null,
    items,
  }
  errorMessage.value = ""
}

function beginEdit() {
  if (!invoice.value) return

  const savedInvoice = invoice.value
  editingId.value = savedInvoice.id
  snapshot.value = savedInvoice.sourceSnapshot
  draft.value = {
    travelDeskTravelRequestId: savedInvoice.travelDeskTravelRequestId,
    recordLocator: savedInvoice.recordLocator,
    sourceBookingEventId: savedInvoice.sourceBookingEventId,
    sourceServiceFeeEventIds: savedInvoice.sourceSnapshot.serviceFeeEvents.map(
      (event) => event.travelOrderIdentifier
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

  const defaultProduct = productTypes.value.find((product) => product.code === "change-fee")
  if (!defaultProduct) return

  draft.value.items.push({
    travelDeskProductTypeId: defaultProduct.id,
    travelDeskFlightSegmentId: null,
    sourceAirSegmentNumber: null,
    sourceServiceFeeEventId: null,
    passengerName: null,
    ticketNumber: null,
    vendor: null,
    description: null,
    saleType: "Sale",
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
    let amount = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"))
    if (item.grossAmount.startsWith("-")) amount = -amount
    if (item.saleType === "Sale") total += amount
    if (item.saleType === "Refund") {
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
      "Enter every amount with up to three decimals, a supported total, and a three-letter uppercase currency code."
    return
  }
  saving.value = true
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
      result = await travelDeskInvoicesApi.update(editingId.value, updates)
    } else {
      result = await travelDeskInvoicesApi.create(draft.value)
    }
    if (version !== contextVersion) return

    closeEditor()
    invoice.value = result.travelDeskInvoice
    snapshot.value = result.travelDeskInvoice.sourceSnapshot
    await loadInvoices()
    snack.success("Invoice saved")
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to save travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be saved.")
  } finally {
    if (version === contextVersion) saving.value = false
  }
}

async function deleteInvoice() {
  const version = contextVersion
  if (!invoice.value || !window.confirm("Delete this invoice?")) return

  deleting.value = true
  try {
    await travelDeskInvoicesApi.delete(invoice.value.id)
    if (version !== contextVersion) return

    invoice.value = null
    snapshot.value = null
    await loadInvoices()
    snack.success("Invoice deleted")
  } catch (error) {
    if (version !== contextVersion) return

    console.error("Failed to delete travel desk invoice", error)
    errorMessage.value = errorText(error, "Invoice could not be deleted.")
  } finally {
    if (version === contextVersion) deleting.value = false
  }
}

watch(
  [requestId, canManage],
  async () => {
    contextVersion += 1
    invoicePage.value = 1
    opening.value = false
    saving.value = false
    deleting.value = false
    searchBusy.value = false
    closeEditor()
    invoice.value = null
    snapshot.value = null
    invoices.value = []
    if (!canManage.value) return
    if (!Number.isInteger(requestId.value) || requestId.value <= 0) {
      errorMessage.value = "Invalid travel request."
      return
    }

    await Promise.all([loadInvoices(), loadProductTypes()])
  },
  { immediate: true }
)
</script>

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
      <v-alert
        v-if="productTypesError"
        type="error"
        class="mb-4"
      >
        {{ productTypesError }}
        <v-btn
          variant="text"
          @click="loadProductTypes"
          >Retry product types</v-btn
        >
      </v-alert>
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <h1 class="text-h5">Travel Desk Invoices</h1>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          :disabled="saving || opening || searchBusy || deleting"
          @click="openNewInvoice"
        >
          New invoice
        </v-btn>
      </div>
      <v-progress-linear
        v-if="loading || opening"
        indeterminate
      />
      <v-btn
        v-if="errorMessage && !loading"
        variant="text"
        @click="loadInvoices"
        >Retry loading invoices</v-btn
      >
      <v-alert
        v-if="!loading && !errorMessage && invoices.length === 0"
        type="info"
      >
        No invoices have been created for this request.
      </v-alert>
      <v-list
        v-if="invoices.length"
        aria-label="Invoices"
      >
        <v-list-item
          v-for="value in invoices"
          :key="value.id"
          :title="value.invoiceNumber || `Invoice ${value.id}`"
          :subtitle="`${value.recordLocator} · ${value.grossAmount} ${value.currencyCode}`"
          :disabled="saving || opening || searchBusy || deleting"
          @click="openInvoice(value.id)"
        >
          <template #append><v-icon icon="mdi-chevron-right" /></template>
        </v-list-item>
      </v-list>
      <v-pagination
        v-if="totalPages > 1"
        v-model="invoicePage"
        :length="totalPages"
        :disabled="saving || opening || searchBusy || deleting"
        @update:model-value="loadInvoices"
      />

      <v-card
        v-if="invoice && !draft && !isCreating"
        class="mt-6"
      >
        <v-card-title>{{ invoice.invoiceNumber || `Invoice ${invoice.id}` }}</v-card-title>
        <v-card-subtitle
          >{{ invoice.recordLocator }} · {{ invoice.grossAmount }}
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
                <td>{{ item.saleType }}</td>
                <td>{{ item.productType.name }}</td>
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
            :disabled="deleting"
            @click="beginEdit"
            >Edit</v-btn
          >
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteInvoice"
            >Delete</v-btn
          >
          <v-btn
            :disabled="deleting"
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
                v-model="recordLocator"
                label="Record locator"
                autocomplete="off"
                maxlength="6"
                :disabled="searchBusy"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="searchBusy"
                >Search booking history</v-btn
              >
            </v-form>
            <v-alert
              v-if="hasSearched && bookingEvents.length === 0"
              type="info"
              class="mt-4"
            >
              No booking events were found for this record locator.
            </v-alert>
            <v-alert
              v-if="hasSearched && bookingEvents.length > 0 && flightBookingEvents.length === 0"
              type="warning"
              class="mt-4"
            >
              This history has no flight booking event. Select another record locator.
            </v-alert>
            <template v-if="flightBookingEvents.length">
              <v-alert
                type="info"
                class="my-4"
              >
                Select the intended booking snapshot. Event order and version numbers do not
                identify a current booking automatically.
              </v-alert>
              <v-radio-group
                v-model="selectedBookingEventId"
                label="Choose one flight booking event"
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
                v-model="selectedFeeEventIds"
                :value="event.travelOrderIdentifier"
                :label="feeSummary(event)"
              />
              <p
                v-if="feeEvents.length === 0"
                class="my-3"
              >
                No service fees are present in this booking history.
              </p>
              <v-btn
                color="primary"
                :disabled="selectedBookingEventId === null || productTypes.length === 0"
                @click="startDraft"
                >Use selected booking</v-btn
              >
            </template>
          </template>
          <template v-else>
            <p class="mb-4">
              Record locator: <strong>{{ draft.recordLocator }}</strong> · Source event
              {{ draft.sourceBookingEventId }}
            </p>
            <v-row>
              <v-col
                cols="12"
                md="4"
                ><v-text-field
                  v-model="draft.currencyCode"
                  label="Currency code"
                  maxlength="3"
                  :disabled="saving"
                  hint="All amounts use this currency; no conversion is performed."
                  persistent-hint
              /></v-col>
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
                  :disabled="saving"
                />
              </v-col>
            </v-row>
            <h2 class="text-h6 my-4">Invoice items</h2>
            <p class="mb-3">
              Enter prices for the selected flight segments. Credits use Refund; Void rows do not
              contribute to the total.
            </p>
            <v-card
              v-for="(item, index) in draft.items"
              :key="index"
              variant="outlined"
              class="mb-3"
            >
              <v-card-text>
                <p
                  v-if="item.sourceAirSegmentNumber !== null"
                  class="mb-3"
                >
                  {{ segmentSummary(item.sourceAirSegmentNumber) }}
                </p>
                <p
                  v-if="item.sourceServiceFeeEventId !== null"
                  class="mb-3"
                >
                  Source service-fee event {{ item.sourceServiceFeeEventId }}
                </p>
                <v-row>
                  <v-col
                    cols="12"
                    md="3"
                    ><v-select
                      v-model="item.travelDeskProductTypeId"
                      :items="productTypes"
                      item-title="name"
                      item-value="id"
                      label="Product type"
                      :disabled="
                        saving ||
                        item.sourceAirSegmentNumber !== null ||
                        item.sourceServiceFeeEventId !== null
                      "
                  /></v-col>
                  <v-col
                    cols="12"
                    md="3"
                    ><v-select
                      v-model="item.saleType"
                      :items="['Sale', 'Refund', 'Void']"
                      label="Sale type"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="3"
                    ><v-text-field
                      v-model="item.grossAmount"
                      label="Amount"
                      inputmode="decimal"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="3"
                    ><v-combobox
                      v-model="item.passengerName"
                      :items="passengerNames"
                      label="Passenger"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="4"
                    ><v-text-field
                      v-model="item.description"
                      label="Description"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="4"
                    ><v-text-field
                      v-model="item.vendor"
                      label="Vendor"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="4"
                    ><v-text-field
                      v-model="item.ticketNumber"
                      label="Ticket number"
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    cols="12"
                    md="8"
                    ><v-select
                      v-model="item.travelDeskFlightSegmentId"
                      :items="localSegments"
                      :item-title="localSegmentSummary"
                      item-value="id"
                      label="Link local flight segment (optional)"
                      clearable
                      :disabled="saving"
                  /></v-col>
                  <v-col
                    v-if="
                      item.sourceAirSegmentNumber === null && item.sourceServiceFeeEventId === null
                    "
                    cols="12"
                    md="4"
                  >
                    <v-btn
                      color="error"
                      variant="text"
                      :disabled="saving"
                      @click="removeCharge(index)"
                      >Remove item</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-plus"
              :disabled="saving || productTypes.length === 0"
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
              Total: enter every amount with up to three decimal places.
            </p>
          </template>
        </v-card-text>
        <v-card-actions class="flex-wrap ga-2">
          <v-btn
            v-if="draft"
            color="primary"
            :loading="saving"
            @click="saveInvoice"
            >Save invoice</v-btn
          >
          <v-btn
            :disabled="saving || searchBusy"
            @click="closeEditor"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
      <v-card
        v-if="snapshot"
        class="mt-4"
        variant="outlined"
      >
        <v-card-text>
          <h2 class="text-h6">Original booking source</h2>
          <p>{{ eventSummary(snapshot.bookingEvent) }}</p>
          <p>Passengers: {{ passengerNames.join(", ") || "None in the selected event" }}</p>
          <p>
            Travel agency:
            {{
              snapshot.bookingEvent.owningAgencyName ||
              snapshot.bookingEvent.transactionAgencyName ||
              "Not supplied"
            }}
          </p>
          <details class="mt-3">
            <summary>Original booking source snapshot</summary>
            <pre class="max-w-full overflow-auto whitespace-pre-wrap overflow-wrap-anywhere">{{
              JSON.stringify(snapshot, null, 2)
            }}</pre>
          </details>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

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
