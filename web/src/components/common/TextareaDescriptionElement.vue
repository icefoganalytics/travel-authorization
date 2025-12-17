<template>
  <DescriptionElement
    :label="label"
    :icon="icon"
    :vertical="vertical"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      class="overflow-auto pa-4 rounded"
      :style="{
        height: normalizedHeight,
        'white-space': 'pre-wrap',
        border: '1px solid #ccc',
      }"
    >
      <slot>{{ value }}</slot>
    </div>
  </DescriptionElement>
</template>

<script setup>
import { computed } from "vue"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import { isNumber } from "lodash"

const props = defineProps({
  /**
   * The label text to display
   */
  label: {
    type: String,
    required: true,
  },
  /**
   * Optional icon name from Material Design Icons (e.g., 'mdi-account')
   */
  icon: {
    type: String,
    default: "",
  },
  /**
   * The value to display. Not required if using slot content
   */
  value: {
    /** @type {string | number | boolean | null} */
    type: [String, Number, Boolean],
    default: "",
  },
  /**
   * Whether to display label and value horizontally or vertically
   */
  vertical: {
    type: Boolean,
    default: false,
  },
  height: {
    type: [String, Number],
    default: "150px",
  },
})

const normalizedHeight = computed(() => {
  const { height } = props
  if (isNumber(height)) return `${height}px`

  return height
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem; /* 8px */
}
</style>
