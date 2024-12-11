<template>
  <v-autocomplete
    :value="value"
    :items="flightPreferenceOrders"
    :label="label"
    :hint="hint"
    auto-select-first
    persistent-hint
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  />
</template>

<script setup>
import { computed } from "vue"
import { times } from "lodash"

import { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"

const props = defineProps({
  value: {
    type: Number,
    default: () => null,
  },
  label: {
    type: String,
    default: "Flight Preference Order",
  },
  numberOfOptions: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["input"])

const flightPreferenceOrders = computed(() => {
  const numbericOptions = times(props.numberOfOptions, (i) => {
    return {
      value: i + 1,
      text: i + 1,
    }
  })

  numbericOptions.push({
    value: DOES_NOT_WORK,
    text: "Does Not Work",
  })

  return numbericOptions
})

const hint = computed(() => {
  if (props.value === DOES_NOT_WORK) {
    return "Please add explanation to Additional Information."
  }

  return ""
})
</script>
