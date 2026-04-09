<template>
  <v-text-field
    :value="locationText"
    :loading="isLoading"
    class="bg-white"
    readonly
    v-bind="$attrs"
    append-inner-icon="mdi-lock"
  />
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useLocation from "@/use/use-location"

const props = defineProps({
  locationId: {
    type: Number,
    default: null,
  },
})

const { locationId } = toRefs(props)
const { location, isLoading } = useLocation(locationId)

const locationText = computed(() => {
  if (isNil(location.value)) return ""

  const { city, province } = location.value
  return `${city} (${province})`
})
</script>
