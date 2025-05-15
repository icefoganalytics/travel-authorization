<template>
  <v-chip outlined>
    <v-progress-circular
      v-if="isLoading"
      size="20"
      width="2"
      indeterminate
    />
    <template v-else-if="isNil(location)">
      <em>unset</em>
    </template>
    <template v-else>
      {{ locationText }}
    </template>
  </v-chip>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useLocation from "@/use/use-location"

const props = defineProps({
  locationId: {
    type: Number,
    default: () => null,
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
