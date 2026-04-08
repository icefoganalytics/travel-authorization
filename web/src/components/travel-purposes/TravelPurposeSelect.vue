<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :model-value="modelValue"
    :items="travelPurposes"
    :loading="isLoading"
    item-value="id"
    item-title="purpose"
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

<script setup lang="ts">
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useTravelPurposes from "@/use/use-travel-purposes"

withDefaults(
  defineProps<{
    modelValue?: number | null | undefined
    label?: string
  }>(),
  {
    modelValue: null,
    label: "Travel Purpose",
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void
}>()

const travelPurposesQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { travelPurposes, isLoading } = useTravelPurposes(travelPurposesQuery)
</script>
