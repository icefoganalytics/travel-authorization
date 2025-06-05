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
        :value="value || ''"
        :label="label || text"
        :rules="rules"
        background-color="white"
        prepend-icon="mdi-calendar"
        outlined
        readonly
        v-bind="{ ...$attrs, ...attrs }"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-bind="$attrs"
      :value="value"
      @input="input"
    ></v-date-picker>
  </v-menu>
</template>

<script>
import { isEmpty } from "lodash"

import { required } from "@/utils/validators"

export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: "Pick a Date",
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
    label: {
      type: String,
      default: undefined,
    },
    rules: {
      type: Array,
      default: () => [required],
    },
  },
  data: () => ({
    menu: false,
  }),
  mounted() {
    if (!isEmpty(this.text) && !isEmpty(this.label)) {
      console.warn("DEPRECATION: text is deprecated, prefer label")
    }
  },
  methods: {
    input(value) {
      this.menu = false
      this.$emit("input", value)
    },
  },
}
</script>
