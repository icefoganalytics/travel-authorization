<template>
  <v-chip outlined>
    <v-progress-circular
      v-if="isLoading"
      size="20"
      width="2"
      indeterminate
    />
    <template v-else-if="isNil(travelPurpose)">
      <em>unset</em>
    </template>
    <template v-else>
      {{ travelPurpose.purpose }}
    </template>
  </v-chip>
</template>

<script setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import useTravelPurpose from "@/use/use-travel-purpose"

const props = defineProps({
  travelPurposeId: {
    type: Number,
    default: () => null,
  },
})

const { travelPurposeId } = toRefs(props)
const { travelPurpose, isLoading } = useTravelPurpose(travelPurposeId)
</script>
