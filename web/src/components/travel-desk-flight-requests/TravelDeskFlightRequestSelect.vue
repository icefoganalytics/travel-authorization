<template>
  <v-select
    :model-value="modelValue"
    :items="formattedTravelDeskFlightRequests"
    :label="label"
    :loading="isLoading"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
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
 *   modelValue: number | null | undefined,
 *   label?: string,
 *   where?: TravelDeskFlightRequestWhereOptions,
 *   filters?: TravelDeskFlightRequestFiltersOptions
 * }}
 */
const props = defineProps({
  modelValue: {
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
 *   "update:modelValue": [travelDeskFlightRequestId: string | null]
 * }}
 */
const emit = defineEmits(["update:modelValue"])

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
    title: buildFlightRequestDescription(travelDeskFlightRequest),
    value: travelDeskFlightRequest.id,
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
