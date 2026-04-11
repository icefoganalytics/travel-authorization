<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="flightPreferenceOrders"
    :label="label"
    :hint="hint"
    auto-select-first
    persistent-hint
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from "vue"
import { times } from "lodash"

import { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(["update:modelValue"])

const flightPreferenceOrders = computed(() => {
  const numbericOptions = times(props.numberOfOptions, (i) => {
    return {
      value: i + 1,
      title: i + 1,
    }
  })

  numbericOptions.push({
    value: DOES_NOT_WORK,
    title: "Does Not Work",
  })

  return numbericOptions
})

const hint = computed(() => {
  if (props.modelValue === DOES_NOT_WORK) {
    return "Please add explanation to Additional Information."
  }

  return ""
})
</script>
