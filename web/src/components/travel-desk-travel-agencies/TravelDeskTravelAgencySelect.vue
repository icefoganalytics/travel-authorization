<template>
  <v-select
    :value="value"
    :items="travelDeskTravelAgencies"
    :label="label"
    :loading="isLoading"
    item-text="agencyName"
    item-value="id"
    v-bind="$attrs"
    @input="emit('input', $event)"
  />
</template>

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import { useTravelDeskTravelAgencies } from "@/use/use-travel-desk-travel-agencies"

/** @typedef {import('@/api/travel-desk-travel-agencies-api.js').TravelDeskTravelAgencyWhereOptions} TravelDeskTravelAgencyWhereOptions */
/** @typedef {import('@/api/travel-desk-travel-agencies-api.js').TravelDeskTravelAgencyFiltersOptions} TravelDeskTravelAgencyFiltersOptions */

/**
 * Defines component props with descriptions and types using JSDoc.
 *
 * @type {{
 *   value: number | null,
 *   where?: TravelDeskTravelAgencyWhereOptions,
 *   filters?: TravelDeskTravelAgencyFiltersOptions
 * }}
 */
const props = defineProps({
  value: {
    type: Number,
    default: () => null,
  },
  label: {
    type: String,
    default: "Assign Agency",
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
 *   input: [travelDeskTravelAgencyId: number | null]
 * }}
 */
const emit = defineEmits(["input"])

const travelDeskTravelAgenciesQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  // TODO: replace max per page with search feature
  perPage: MAX_PER_PAGE,
}))
const { travelDeskTravelAgencies, isLoading } = useTravelDeskTravelAgencies(
  travelDeskTravelAgenciesQuery
)
</script>
