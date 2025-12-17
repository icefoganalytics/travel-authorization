<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :value="value"
    :items="travelPurposes"
    :loading="isLoading"
    :item-text="itemText"
    :item-value="itemValue"
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

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useTravelPurposes from "@/use/use-travel-purposes"

defineProps({
  value: {
    type: [Number, String],
    default: null,
  },
  itemText: {
    type: [String, Array, Function], // See https://v2.vuetifyjs.com/en/api/v-select/#props-item-text
    default: "purpose",
  },
  itemValue: {
    type: [String, Array, Function],
    default: "id",
  },
  label: {
    type: String,
    default: "Travel Purpose",
  },
})

const emit = defineEmits(["input"])

const travelPurposesQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { travelPurposes, isLoading } = useTravelPurposes(travelPurposesQuery)
</script>
