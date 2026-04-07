<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :model-value="modelValue"
    :items="months"
    :label="label"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
    ><template
      v-for="(_, slotName) in $slots"
      #[slotName]="slotData"
      ><slot
        :name="slotName"
        v-bind="slotData"
      ></slot></template
  ></v-select>
</template>

<script>
export const MONTHS = Object.freeze([
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
])
</script>

<script setup>
import { computed } from "vue"

defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: "Month",
  },
})

const emit = defineEmits(["update:modelValue"])

const months = computed(() => MONTHS)
</script>
