<template>
  <v-text-field
    v-bind="$attrs"
    :value="displayValue"
    :prefix="prefix"
    @input="updateValue"
    @blur="formatValue"
    @focus="selectAll"
  ></v-text-field>
</template>

<script setup lang="ts">
import { isEmpty, isNaN, isNil } from "lodash"
import { nextTick, ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    value?: number | string
    prefix?: string
  }>(),
  {
    value: 0,
    prefix: "$",
  }
)

const emit = defineEmits<{
  (event: "input", value: number): void
}>()

const rawValue = ref<number | string>(props.value)
const displayValue = ref("")

watch(
  () => props.value,
  (newValue) => {
    rawValue.value = newValue
    displayValue.value = buildFormattedDisplayValue(newValue)
  },
  {
    immediate: true,
  }
)

function updateValue(value: string) {
  displayValue.value = value

  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) {
    rawValue.value = ""
    emit("input", 0)
    return
  }

  rawValue.value = numericValue
  emit("input", numericValue)
}

function showRawValue() {
  displayValue.value = buildEditableDisplayValue(rawValue.value)
}

function formatValue() {
  displayValue.value = buildFormattedDisplayValue(rawValue.value)
}

async function selectAll(event: FocusEvent) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }

  showRawValue()
  await nextTick()
  target.select()
}

function buildEditableDisplayValue(value: number | string | null | undefined) {
  if (isNil(value)) {
    return ""
  }

  if (typeof value === "string") {
    return value
  }

  return String(value)
}

function buildFormattedDisplayValue(value: number | string | null | undefined) {
  if (isNil(value)) {
    return "0.00"
  }

  if (typeof value === "string" && isEmpty(value.trim())) {
    return "0.00"
  }

  const parsedValue = parseFloat(String(value))
  if (isNaN(parsedValue)) {
    return "0.00"
  }

  return parsedValue.toFixed(2)
}
</script>
