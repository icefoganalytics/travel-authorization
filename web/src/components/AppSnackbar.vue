<template>
  <v-snackbar
    v-model="showSnackbar"
    v-bind="
      merge(
        {
          multiLine: true,
          timeout: defaultTimeout,
        },
        options
      )
    "
  >
    {{ message }}
    <template #actions>
      <!-- Inherit the snackbar foreground instead of the global primary button color. -->
      <v-btn
        color=""
        variant="text"
        @click="close"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from "vue"
import { isEmpty, merge } from "lodash"
import { useSnack } from "@/use/use-snack"

const { message, options, reset } = useSnack()

const showSnackbar = ref(false)
const defaultTimeout = 4000

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
</script>
