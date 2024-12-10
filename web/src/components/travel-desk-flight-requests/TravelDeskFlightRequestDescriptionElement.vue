<template>
  <DescriptionElement
    :value="formattedTravelDeskFlightRequest"
    :label="label"
    :loading="isLoading"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import formatDate from "@/utils/format-date"

import useTravelDeskFlightRequest from "@/use/use-travel-desk-flight-request"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequest} TravelDeskFlightRequest */

/**
 * @type {{
 *   travelDeskFlightRequestId: number | null | undefined,
 *   label?: string,
 * }}
 */
const props = defineProps({
  travelDeskFlightRequestId: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: "Flight Request",
  },
})

const { travelDeskFlightRequestId } = toRefs(props)
const { travelDeskFlightRequest, isLoading } = useTravelDeskFlightRequest(travelDeskFlightRequestId)

const formattedTravelDeskFlightRequest = computed(() =>
  buildFlightRequestDescription(travelDeskFlightRequest.value)
)

/**
 * @param travelDeskFlightRequest {TravelDeskFlightRequest}
 */
function buildFlightRequestDescription(travelDeskFlightRequest) {
  if (isNil(travelDeskFlightRequest)) return "..."

  const { departLocation, arriveLocation, datePreference } = travelDeskFlightRequest
  const formattedDate = formatDate(datePreference)
  return `${departLocation} -> ${arriveLocation} @ ${formattedDate}`
}
</script>
