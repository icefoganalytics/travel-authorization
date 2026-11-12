<template>
  <v-card class="mt-4">
    <v-card-title>2. TravelPort booking</v-card-title>
    <v-card-text>
      <p class="mb-3">
        Current linked locator: <strong>{{ recordLocator || "None" }}</strong>
      </p>
      <p class="mb-4">
        Link one TravelPort booking for invoicing. Replacing or clearing this link does not change
        saved invoices, the invoice number, or the PNR document.
      </p>
      <v-text-field
        v-model="search"
        label="Search locator prefix"
        autocomplete="off"
        variant="outlined"
        :disabled="isSaving"
        clearable
      />
      <v-alert
        v-if="errorMessage || saveError"
        type="error"
        class="mb-3"
      >
        {{ errorMessage || saveError }}
        <v-btn
          v-if="errorMessage"
          variant="text"
          @click="fetch"
          >Retry lookup</v-btn
        >
      </v-alert>
      <v-progress-linear
        v-if="isNil(travelPortBookings)"
        indeterminate
      />
      <v-radio-group
        v-else
        v-model="selectedLocator"
        label="Choose a TravelPort locator"
        :disabled="isSaving"
      >
        <v-radio
          :value="null"
          label="No linked booking"
        />
        <v-radio
          v-if="
            selectedLocator &&
            !travelPortBookings.some((booking) => booking.recordLocator === selectedLocator)
          "
          :value="selectedLocator"
          :label="`${selectedLocator} (selected)`"
        />
        <v-radio
          v-for="booking in travelPortBookings"
          :key="booking.recordLocator"
          :value="booking.recordLocator"
          :label="booking.recordLocator"
        />
      </v-radio-group>
      <p v-if="travelPortBookings?.length === 0 && !errorMessage">No matching locators found.</p>
      <EnhancedPagination
        v-if="totalCount > perPage"
        v-model="page"
        v-model:per-page="perPage"
        :total-count="totalCount"
        :disabled="isSaving"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="primary"
        :loading="isSaving"
        :disabled="selectedLocator === recordLocator"
        @click="saveLink"
        >Save booking link</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue"
import { isNil } from "lodash"

import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"

import ApiError from "@/api/api-error"
import { travelPortBookingsApi } from "@/api/travel-desk-travel-requests/travel-port-bookings-api"

import useSnack from "@/use/use-snack"
import { useTravelPortBookings } from "@/use/travel-desk-travel-requests/use-travel-port-bookings"

import EnhancedPagination from "@/components/common/EnhancedPagination.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  recordLocator: string | null
}>()
const emit = defineEmits<{
  saved: [recordLocator: string | null]
}>()
const { travelDeskTravelRequestId } = toRefs(props)
const search = ref<string | null>("")
const selectedLocator = ref<string | null>(props.recordLocator)
const isSaving = ref(false)
const saveError = ref("")
const snack = useSnack()
const { page, perPage } = useRouteQueryPagination({
  routeQuerySuffix: "TravelPortBookings",
})
const options = computed(() => ({
  search: (search.value ?? "").trim().toUpperCase(),
  page: page.value,
  perPage: perPage.value,
}))
const { travelPortBookings, totalCount, errorMessage, fetch } = useTravelPortBookings(
  travelDeskTravelRequestId,
  options
)

watch(search, () => {
  page.value = 1
})
watch([travelDeskTravelRequestId, () => props.recordLocator], () => {
  selectedLocator.value = props.recordLocator
  saveError.value = ""
})

async function saveLink() {
  const recordLocator = selectedLocator.value
  isSaving.value = true
  saveError.value = ""
  try {
    await travelPortBookingsApi.update(props.travelDeskTravelRequestId, recordLocator)
    emit("saved", recordLocator)
    snack.success("TravelPort booking link saved")
  } catch (error) {
    console.error("Failed to save TravelPort booking link", error)
    saveError.value = error instanceof ApiError ? error.message : "Booking link could not be saved."
    snack.error(saveError.value)
  } finally {
    isSaving.value = false
  }
}
</script>
