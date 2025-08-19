<template>
  <span class="ml-2">
    <input
      ref="fileInputRef"
      class="d-none"
      type="file"
      @change="uploadFileAndEmit"
    />
    <v-btn
      color="primary"
      :loading="isLoading"
      @click="triggerFileInput"
    >
      Add Receipt
    </v-btn>
  </span>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { ref } from "vue"

import expensesApi from "@/api/expenses-api"
import useSnack from "@/use/use-snack"

const props = defineProps<{
  expenseId: number
}>()

// TODO: switch to `uploaded: [void]` syntax in vue 3
const emit = defineEmits<{
  (event: "uploaded"): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

const snack = useSnack()

async function uploadFileAndEmit(event: Event) {
  const target = event.target as HTMLInputElement
  const { files } = target
  if (isNil(files) || isEmpty(files)) return

  const file = files[0]

  isLoading.value = true
  try {
    await expensesApi.upload(props.expenseId, file)

    emit("uploaded")
    snack.success("Receipt uploaded!")
  } catch (error) {
    console.error(`Failed to upload receipt: ${error}`, { error })
    snack.error(`Failed to upload receipt: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
