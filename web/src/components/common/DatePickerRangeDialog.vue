<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on }">
      <v-text-field
        :value="dateRangeText"
        :label="label"
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="activatorProps"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="selectedDateRange"
      range
      @change="emitInput"
    ></v-date-picker>
  </v-menu>
</template>

<script setup>
import { computed, ref, watchEffect } from "vue"

const props = defineProps({
  value: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: "Pick date range",
  },
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["input"])

const showMenu = ref(false)

const dateRangeText = computed(() => props.value.join(" ~ "))

const selectedDateRange = ref(props.value)

watchEffect(() => {
  selectedDateRange.value = props.value
})

function emitInput(value) {
  emit("input", value)
}
</script>
