<template>
  <v-text-field
    ref="inputRef"
    :model-value="formattedValue"
    :rules="transformedRules"
    type="text"
    @focus="onFocus"
    @blur="onBlur"
    @keydown.escape="resetValue"
    @keydown.enter="onEnter"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { CurrencyDisplay, type CurrencyInputOptions, useCurrencyInput } from "vue-currency-input"
import { isNil, isString } from "lodash"

type ValidationRule = (value: unknown) => boolean | string

const DEFAULT_OPTIONS = {
  currency: "CAD",
  locale: "en-CA",
  currencyDisplay: CurrencyDisplay.symbol,
  precision: 2,
  hideCurrencySymbolOnFocus: true,
}

const props = withDefaults(
  defineProps<{
    modelValue: number | string | null | undefined
    options?: Partial<CurrencyInputOptions>
    rules?: ValidationRule[]
  }>(),
  {
    options: () => ({}),
    rules: () => [],
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: number | string | null | undefined): void
}>()

const initialNumberValue = ref(props.modelValue)

const { inputRef, numberValue, setValue, setOptions, formattedValue } = useCurrencyInput(
  {
    ...DEFAULT_OPTIONS,
    ...props.options,
  },
  false
)

// Validate against numberValue because formattedValue includes the currency symbol and separators.
const transformedRules = computed(() =>
  props.rules.map((rule) => {
    return () => rule(numberValue.value)
  })
)

watch(
  () => props.modelValue,
  (value) => {
    if (isNil(value)) {
      setValue(null)
    } else if (isString(value)) {
      setValue(parseFloat(value))
    } else {
      setValue(value)
    }
  },
  {
    immediate: true,
  }
)

watch(
  () => props.options,
  (options) => {
    setOptions({
      ...DEFAULT_OPTIONS,
      ...options,
    })
  }
)

function onFocus() {
  initialNumberValue.value = numberValue.value
}

function onBlur() {
  if (numberValue.value === null) {
    resetValue()
    return
  }

  emit("update:modelValue", numberValue.value)
}

function onEnter() {
  emit("update:modelValue", numberValue.value)
}

function resetValue() {
  if (isNil(initialNumberValue.value)) {
    setValue(null)
  } else if (isString(initialNumberValue.value)) {
    setValue(parseFloat(initialNumberValue.value))
  } else {
    setValue(initialNumberValue.value)
  }

  emit("update:modelValue", initialNumberValue.value)
}
</script>
