<template>
  <v-radio-group
    :value="value"
    v-bind="$attrs"
    v-on="$listeners"
    @change="emit('input', $event)"
  >
    <v-radio
      label="Round trip"
      :value="TRIP_TYPES.ROUND_TRIP"
    ></v-radio>
    <v-radio
      label="One way"
      :value="TRIP_TYPES.ONE_WAY"
    ></v-radio>
    <v-radio
      label="Multi-city"
      :value="TRIP_TYPES.MULTI_CITY"
    ></v-radio>
  </v-radio-group>
</template>

<script setup>
import { TRIP_TYPES } from "@/api/travel-authorizations-api"

defineProps({
  value: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["input"])
</script>
