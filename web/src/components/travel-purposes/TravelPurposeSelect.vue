<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :value="value"
    :items="travelPurposes"
    :loading="isLoading"
    item-value="id"
    item-text="purpose"
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

<script setup lang="ts">
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useTravelPurposes from "@/use/use-travel-purposes"

withDefaults(
  defineProps<{
    value?: number | null | undefined
    label?: string
  }>(),
  {
    value: null,
    label: "Travel Purpose",
  }
)

const emit = defineEmits<{
  (event: "input", value: number): void
}>()

const travelPurposesQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { travelPurposes, isLoading } = useTravelPurposes(travelPurposesQuery)
</script>
