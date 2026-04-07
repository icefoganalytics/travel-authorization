<template>
  <v-select
    :value="value"
    :items="formattedTravelDeskFlightRequests"
    :label="label"
    :loading="isLoading"
    v-bind="$attrs"
    @input="emit('input', $event)"
  />
</template>

<script setup>
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import { MAX_PER_PAGE } from "@/api/base-api"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequest} TravelDeskFlightRequest */
/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequestWhereOptions} TravelDeskFlightRequestWhereOptions */
/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequestFiltersOptions} TravelDeskFlightRequestFiltersOptions */

/**
 * Defines component props with descriptions and types using JSDoc.
 *
 * @type {{
 *   value: number | null | undefined,
 *   label?: string,
 *   where?: TravelDeskFlightRequestWhereOptions,
 *   filters?: TravelDeskFlightRequestFiltersOptions
 * }}
 */
const props = defineProps({
  value: {
    type: Number,
    default: () => null,
  },
  label: {
    type: String,
    default: "Flight Request",
  },
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
})

/**
 * @type {{
 *   input: [travelDeskFlightRequestId: string | null]
 * }}
 */
const emit = defineEmits(["input"])

const travelDeskFlightRequestsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  // TODO: replace max per page with search feature
  perPage: MAX_PER_PAGE,
}))
const { travelDeskFlightRequests, isLoading } = useTravelDeskFlightRequests(
  travelDeskFlightRequestsQuery
)
const formattedTravelDeskFlightRequests = computed(() =>
  travelDeskFlightRequests.value.map((travelDeskFlightRequest) => ({
    value: travelDeskFlightRequest.id,
    text: buildFlightRequestDescription(travelDeskFlightRequest),
  }))
)

/**
 * @param travelDeskFlightRequest {TravelDeskFlightRequest}
 */
function buildFlightRequestDescription(travelDeskFlightRequest) {
  const { departLocation, arriveLocation, datePreference } = travelDeskFlightRequest
  const formattedDate = formatDate(datePreference)
  return `${departLocation} -> ${arriveLocation} @ ${formattedDate}`
}
</script>
