<template>
  <v-select
    :model-value="modelValue"
    :items="travelDeskTravelAgencies"
    :label="label"
    :loading="isLoading"
    item-text="agencyName"
    item-value="id"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
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
 *   modelValue: number | null,
 *   where?: TravelDeskTravelAgencyWhereOptions,
 *   filters?: TravelDeskTravelAgencyFiltersOptions
 * }}
 */
const props = defineProps({
  modelValue: {
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
 *   "update:modelValue": [travelDeskTravelAgencyId: number | null]
 * }}
 */
const emit = defineEmits(["update:modelValue"])

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
