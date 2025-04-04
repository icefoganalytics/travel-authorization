<template>
  <span
    v-if="disabled"
    ref="spanNativeRef"
  >
    <v-btn
      :disabled="disabled"
      v-bind="merge($attrs, buttonProps)"
      v-on="$listeners"
    >
      <slot></slot>
    </v-btn>
    <v-tooltip
      :activator="spanNativeRef"
      v-bind="tooltipProps"
    >
      <slot name="tooltip"
        ><span>{{ tooltipText }}</span></slot
      >
    </v-tooltip>
  </span>
  <v-btn
    v-else
    :disabled="disabled"
    v-bind="merge($attrs, buttonProps)"
    v-on="$listeners"
  >
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: "TooltipButton",
  inheritAttrs: false,
}
</script>

<script setup>
import { ref } from "vue"
import { merge } from "lodash"

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  tooltipText: {
    type: String,
    default: "",
  },
  buttonProps: {
    type: Object,
    default: () => ({}),
  },
  tooltipProps: {
    type: Object,
    default: () => ({
      bottom: true,
    }),
  },
})

/** NOTE: refs on native components don't have $el, they _are_ the $el. */
const spanNativeRef = ref(null)
</script>
