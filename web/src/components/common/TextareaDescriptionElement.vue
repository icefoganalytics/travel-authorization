<template>
  <DescriptionElement
    :label="label"
    :icon="icon"
    :vertical="vertical"
    v-bind="$attrs"
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

<script setup lang="ts">
import { computed } from "vue"
import { isNumber } from "lodash"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

const props = withDefaults(
  defineProps<{
    /**
     * The label text to display
     */
    label: string
    icon?: string
    value?: string | number | boolean | null
    vertical?: boolean
    height?: string | number
  }>(),
  {
    /**
     * Optional icon name from Material Design Icons (e.g., 'mdi-account')
     */
    icon: "",
    /**
     * The value to display. Not required if using slot content
     */
    value: "",
    /**
     * Whether to display label and value horizontally or vertically
     */
    vertical: false,
    /**
     * Height of the textarea
     */
    height: "150px",
  }
)

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
