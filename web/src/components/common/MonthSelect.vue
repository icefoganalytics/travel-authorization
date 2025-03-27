<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :value="value"
    :items="months"
    :label="label"
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
  value: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: "Month",
  },
})

const emit = defineEmits(["input"])

const months = computed(() => MONTHS)
</script>
