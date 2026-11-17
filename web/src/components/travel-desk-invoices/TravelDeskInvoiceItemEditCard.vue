<template>
  <v-card variant="outlined">
    <v-card-text>
      <p
        v-if="item.sourceAirSegmentNumber !== null"
        class="mb-3"
      >
        {{ sourceSegmentDescription }}
      </p>
      <p
        v-if="item.sourceServiceFeeEventExternalIdentifier !== null"
        class="mb-3"
      >
        Source service-fee event {{ item.sourceServiceFeeEventExternalIdentifier }}
      </p>
      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <v-select
            v-model="item.productType"
            :items="productTypes"
            label="Product type"
            :disabled="
              isSaving ||
              item.sourceAirSegmentNumber !== null ||
              item.sourceServiceFeeEventExternalIdentifier !== null
            "
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-select
            v-model="item.saleType"
            :items="['Sale', 'Refund', 'Void']"
            label="Sale type"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="item.grossAmount"
            label="Amount"
            inputmode="decimal"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-combobox
            v-model="item.passengerName"
            :items="passengerNames"
            label="Passenger"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="item.description"
            label="Description"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="item.vendor"
            label="Vendor"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="item.ticketNumber"
            label="Ticket number"
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          cols="12"
          md="8"
        >
          <v-select
            v-model="item.travelDeskFlightSegmentId"
            :items="localSegments"
            :item-title="localSegmentSummary"
            item-value="id"
            label="Link local flight segment (optional)"
            clearable
            :disabled="isSaving"
          />
        </v-col>
        <v-col
          v-if="
            item.sourceAirSegmentNumber === null &&
            item.sourceServiceFeeEventExternalIdentifier === null
          "
          cols="12"
          md="4"
        >
          <v-btn
            color="error"
            variant="text"
            :disabled="isSaving"
            @click="emit('removed')"
            >Remove item</v-btn
          >
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import type { TravelDeskFlightSegmentAsIndex } from "@/api/travel-desk-flight-segments-api"
import {
  type InvoiceItemInput,
  TravelDeskInvoiceItemProductTypes,
} from "@/api/travel-desk-invoices-api"

const item = defineModel<InvoiceItemInput>({
  required: true,
})

defineProps<{
  localSegments: TravelDeskFlightSegmentAsIndex[]
  passengerNames: string[]
  sourceSegmentDescription: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  removed: []
}>()

const { t } = useI18n()
const productTypes = computed(() =>
  Object.values(TravelDeskInvoiceItemProductTypes).map((productType) => ({
    title: t(`travel_desk_invoice_item.product_type.${productType}`),
    value: productType,
  }))
)

function localSegmentSummary(segment: TravelDeskFlightSegmentAsIndex) {
  return `${segment.flightNumber ?? "Flight"} · ${segment.departLocation ?? ""} → ${segment.arriveLocation ?? ""} · ${segment.departAt ?? "date unavailable"}`
}
</script>
