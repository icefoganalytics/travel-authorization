<template>
  <v-autocomplete
    :value="value"
    :items="formattedLocations"
    :loading="isLoading"
    auto-select-first
    v-bind="$attrs"
    v-on="$listeners"
    @input="emit('input', $event)"
    ><template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
      ><slot
        :name="slotName"
        v-bind="slotData"
      ></slot></template
  ></v-autocomplete>
</template>

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useLocations from "@/use/use-locations"

const props = defineProps({
  value: {
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

const emit = defineEmits(["input"])

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
      value: id,
      text: `${city} (${province})`,
      // These legacy fields support using location selector string values.
      city,
      province,
    }
  })
})
</script>
