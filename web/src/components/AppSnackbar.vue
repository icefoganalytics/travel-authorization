<template>
  <v-snackbar
    v-model="showSnackbar"
    v-bind="{ multiLine: true, timeout: defaultTimeout, ...options }"
  >
    <span :class="`text-${constrastingColor}`">
      {{ message }}
    </span>
    <template #action="{ attrs }">
      <v-btn :color="constrastingColor" text v-bind="attrs" @click="close">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { isEmpty } from "lodash"
import { useSnack } from "@/use/use-snack"

const { message, options, reset } = useSnack()

const showSnackbar = ref(false)
const defaultTimeout = 4000

const constrastingColor = computed(() => getContrastingColor(options.value.color))

watch(
  () => [message.value, options.value],
  () => {
    if (isEmpty(message.value)) return
    showSnackbar.value = true
  },
  { deep: true, immediate: true }
)

watch(
  () => showSnackbar.value,
  (newShowSnackbar) => {
    if (newShowSnackbar === false) {
      reset()
    }
  }
)

function close() {
  showSnackbar.value = false
}

function getContrastingColor(color) {
  if (color === undefined) return "white"

  const colorMap = {
    primary: "white",
    secondary: "black",
    accent: "black",
    error: "white",
    info: "white",
    success: "white",
    warning: "black",
  }

  return colorMap[color] || "white"
}
</script>
