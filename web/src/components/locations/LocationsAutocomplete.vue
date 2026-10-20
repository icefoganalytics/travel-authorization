<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="formattedLocations"
    :loading="isLoading"
    auto-select-first
    v-bind="$attrs"
    @update:model-value="emitLocation"
  />
</template>

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useLocations from "@/use/use-locations"

const props = defineProps({
  modelValue: {
    /** @type {number | string | null | undefined} */
    type: [Number, String],
    default: null,
  },
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  // TODO: replace legacy inTerritory prop with new filter pattern
  inTerritory: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:modelValue", "update:province"])

const byProvinceFilter = computed(() => {
  if (props.inTerritory) {
    return { byProvince: "YT" }
  }

  return {}
})
const locationsQuery = computed(() => {
  return {
    where: props.where,
    filters: {
      ...byProvinceFilter.value,
      ...props.filters,
    },
    // TODO: replace max per page with search feature at some point
    perPage: MAX_PER_PAGE,
  }
})
const { locations, isLoading } = useLocations(locationsQuery)

const formattedLocations = computed(() => {
  return locations.value.map(({ id, city, province }) => {
    return {
      title: `${city} (${province})`,
      value: id,
      // These legacy fields support using location selector string values.
      // In the future we should update the data model to seprate city and province values,
      // while ensuring city string values are unique.
      cityUniqueLegacy: `${city} (${province})`,
      province,
    }
  })
})

/** @param {number | string | null} value */
function emitLocation(value) {
  emit("update:modelValue", value)

  const selectedLocation = formattedLocations.value.find((location) => {
    return location.value === value || location.cityUniqueLegacy === value
  })
  if (selectedLocation) {
    emit("update:province", selectedLocation.province)
  }
}
</script>
