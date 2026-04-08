<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        :model-value="dateRangeText"
        :label="label"
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="activatorProps"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="selectedDateRange"
      range
      @update:model-value="emitInput"
    ></v-date-picker>
  </v-menu>
</template>

<script setup>
import { computed, ref, watchEffect } from "vue"

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: "Pick date range",
  },
})

const emit = defineEmits(["update:modelValue"])

const showMenu = ref(false)

const dateRangeText = computed(() => props.modelValue.join(" ~ "))

const selectedDateRange = ref(props.modelValue)

watchEffect(() => {
  selectedDateRange.value = props.modelValue
})

function emitInput(value) {
  emit("update:modelValue", value)
}
</script>
