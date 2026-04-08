<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :model-value="modelValue"
    :items="travelPurposes"
    :loading="isLoading"
    :item-title="itemText"
    :item-value="itemValue"
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

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useTravelPurposes from "@/use/use-travel-purposes"

defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  itemText: {
    type: [String, Array, Function], // See https://v3.vuetifyjs.com/en/api/v-select/#props-item-title
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

const emit = defineEmits(["update:modelValue"])

const travelPurposesQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { travelPurposes, isLoading } = useTravelPurposes(travelPurposesQuery)
</script>
