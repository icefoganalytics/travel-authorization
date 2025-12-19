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

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useTravelPurpose from "@/use/use-travel-purpose"

const props = withDefaults(
  defineProps<{
    travelPurposeId?: number | null | undefined
  }>(),
  {
    travelPurposeId: null,
  }
)

const { travelPurposeId } = toRefs(props)
const { travelPurpose, isLoading } = useTravelPurpose(travelPurposeId)
</script>
