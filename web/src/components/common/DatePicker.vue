<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :offset="8"
    :nudge-right="40"
    transition="scale-transition"
    min-width="auto"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        :model-value="modelValue || ''"
        :label="label"
        :rules="rules"
        append-inner-icon="mdi-calendar"
        background-color="white"
        variant="outlined"
        readonly
        v-bind="merge({}, $attrs, activatorProps)"
      ></v-text-field>
    </template>
    <v-date-picker
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="closeAndEmitInput"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { ref } from "vue"
import { isNil, merge } from "lodash"

import { required } from "@/utils/validators"

withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    rules?: ((value: unknown) => boolean | string)[]
  }>(),
  {
    modelValue: undefined,
    label: "Pick a Date",
    rules: () => [required],
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void
}>()

const menu = ref(false)

function closeAndEmitInput(value: string | null) {
  menu.value = false

  if (isNil(value)) {
    emit("update:modelValue", "")
    return
  } else {
    emit("update:modelValue", value)
  }
}
</script>
