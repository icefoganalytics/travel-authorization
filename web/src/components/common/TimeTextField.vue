<template>
  <v-text-field
    v-model="time"
    :label="label"
    :rules="[...rules, timeValidator]"
    background-color="white"
    outlined
    placeholder="HH:MM"
    persistent-placeholder
    prepend-icon="mdi-clock"
    maxlength="5"
    validate-on-blur
    v-bind="$attrs"
    @input="updateInput"
    @click:clear="updateInput(null)"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { isNil } from "lodash"

import { type ValidationRules } from "@/utils/validators/utility-types"

const props = withDefaults(
  defineProps<{
    value?: string
    label?: string
    rules?: ValidationRules
  }>(),
  {
    value: undefined,
    label: "Time (24 hour)",
    rules: () => [],
  }
)

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "input", value: string | null): void
}>()

function stripSeconds(hhmmss: string | null | undefined) {
  if (isNil(hhmmss)) return null

  return hhmmss.split(":").slice(0, 2).join(":")
}

const time = ref(stripSeconds(props.value))

watch(
  () => props.value,
  (newValue) => {
    time.value = stripSeconds(newValue)
  }
)

watch(
  () => time.value,
  (newTime, oldTime) => {
    if (isNil(newTime) || isNil(oldTime)) return

    if (oldTime.length === 1 && newTime.length === 2 && !newTime.includes(":")) {
      // e.g. 1234 -> 12:34
      time.value = `${newTime}:`
    } else if (oldTime.length === 4 && newTime.length === 3 && newTime.endsWith(":")) {
      // e.g. 12:34 -> 12:3 -> 12: -> 12
      time.value = newTime.replace(":", "")
    } else if (
      // e.g. 9:45 -> 09:45
      newTime.includes(":") &&
      !oldTime.includes(":") &&
      newTime.split(":")[0].length === 1
    ) {
      time.value = `0${newTime}`
    }
  }
)

function timeValidator(value: string | null | undefined) {
  if (isNil(value)) return true

  const [hours, minutes] = value.split(":")

  if (hours.length !== 2 || minutes.length !== 2) {
    return "Invalid time format."
  }

  const hoursInt = parseInt(hours)
  const minutesInt = parseInt(minutes)

  if (hoursInt < 0 || hoursInt > 23) {
    return "Invalid hours."
  }

  if (minutesInt < 0 || minutesInt > 59) {
    return "Invalid minutes."
  }

  return true
}

function updateInput(value: string | null) {
  emit("input", value)
}
</script>
