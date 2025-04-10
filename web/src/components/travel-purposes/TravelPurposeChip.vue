<template>
  <v-chip outlined>
    <v-progress-circular
      v-if="isNil(travelPurpose)"
      size="20"
      width="2"
      color="white"
      indeterminate
    />
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
const { travelPurpose } = useTravelPurpose(travelPurposeId)
</script>
