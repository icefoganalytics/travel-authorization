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
        :label="label"
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
      @input="closeAndEmitInput"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { required } from "@/utils/validators"
import { ref } from "vue"

const props = withDefaults(
  defineProps<{
    value?: string | null
    label?: string
    rules?: ((value: unknown) => boolean | string)[]
  }>(),
  {
    value: undefined,
    label: "Pick a Date",
    rules: () => [required],
  }
)

const emit = defineEmits<{
  (event: "input", value: string): void
}>()

const menu = ref(false)

function closeAndEmitInput(value: string) {
  menu.value = false
  emit("input", value)
}
</script>
