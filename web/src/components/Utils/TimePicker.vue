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
        :label="label || text"
        prepend-icon="mdi-clock"
        background-color="white"
        outlined
        readonly
        :disabled="review"
        :rules="requiredRules"
        v-bind="attrs"
        v-on="on"
      >
      </v-text-field>
    </template>
    <v-time-picker
      format="24hr"
      scrollable
      :value="value"
      :rules="requiredRules"
      @input="input"
    >
    </v-time-picker>
  </v-menu>
</template>

<script setup>
import { ref } from "vue"

defineProps({
  value: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: "Time (24h)",
  },
  text: {
    type: String,
    default: undefined,
    validator(value) {
      if (value !== undefined) {
        console.warn('The "text" prop is deprecated; prefer using "label" instead.')
      }
      return true
    },
  },
  // TODO: remove this field
  review: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["input"])

const menu = ref(false)

const requiredRules = [(v) => !!v || "This field is required"]

function input(value) {
  menu.value = false
  emit("input", value)
}
</script>
