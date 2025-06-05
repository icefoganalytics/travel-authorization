<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        dense
        :value="value"
        :label="label"
        prepend-icon="mdi-clock"
        background-color="white"
        outlined
        readonly
        v-bind="merge(attrs, fieldOptions)"
        v-on="on"
      >
      </v-text-field>
    </template>
    <v-time-picker
      format="24hr"
      scrollable
      :value="value"
      v-bind="dateOptions"
      @input="input"
    >
    </v-time-picker>
  </v-menu>
</template>

<script setup>
import { ref } from "vue"
import { merge } from "lodash"

defineProps({
  value: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: "Time (24 hour)",
  },
  dateOptions: {
    type: Object,
    default: () => ({}),
  },
  fieldOptions: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["input"])

const menu = ref(false)

function input(value) {
  menu.value = false
  emit("input", value)
}
</script>
