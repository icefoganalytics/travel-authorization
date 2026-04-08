<template>
  <v-radio-group
    :model-value="modelValue"
    :label="label"
    v-bind="$attrs"
    @update:model-value="emitUpdateModelValue"
  >
    <div class="d-flex align-baseline">
      <v-radio
        label="Yes"
        :value="true"
      ></v-radio>
      <v-radio
        class="ml-4"
        label="No"
        :value="false"
      ></v-radio>
    </div>
  </v-radio-group>
</template>

<script setup lang="ts">
import { isNil } from "lodash"

/**
 * Special v-radio group where label is above row of radio buttons.
 * This is different than v-radio-group "row" layout where label is to the left of radio buttons.
 */
withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
  }>(),
  {
    modelValue: false,
    label: "Pick yes or no:",
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
}>()

function emitUpdateModelValue(value: boolean | null) {
  if (isNil(value)) {
    emit("update:modelValue", false)
  } else {
    emit("update:modelValue", value)
  }
}
</script>
